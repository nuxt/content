import { useRuntimeConfig } from '#imports'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { decompressSQLDump, decryptAndDecompressSQLDump } from './dump'
import { refineContentFields } from './collection'
import { fetchDatabase, fetchDumpKey } from './api'
import type { DatabaseAdapter, DatabaseBindParams } from '@nuxt/content'
import { checksums, tables } from '#content/manifest'

let db: Database
const loadedCollections: Record<string, string> = {}
const dbPromises: Record<string, Promise<Database>> = {}

export function loadDatabaseAdapter<T>(collection: T): DatabaseAdapter {
  async function loadAdapter(collection: T) {
    if (!db) {
      dbPromises._ = dbPromises._ || initializeDatabase()
      db = await dbPromises._
      Reflect.deleteProperty(dbPromises, '_')
    }
    if (!loadedCollections[String(collection)]) {
      dbPromises[String(collection)] =
        dbPromises[String(collection)] || loadCollectionDatabase(collection)
      await dbPromises[String(collection)]
      loadedCollections[String(collection)] = 'loaded'
      Reflect.deleteProperty(dbPromises, String(collection))
    }

    return db
  }

  return {
    all: async <T>(sql: string, params?: DatabaseBindParams) => {
      await loadAdapter(collection)
      return db
        .exec({
          sql,
          bind: params,
          rowMode: 'object',
          returnValue: 'resultRows',
        })
        .map(row => refineContentFields(sql, row) as T)
    },
    first: async <T>(sql: string, params?: DatabaseBindParams) => {
      await loadAdapter(collection)
      return refineContentFields(
        sql,
        db
          .exec({
            sql,
            bind: params,
            rowMode: 'object',
            returnValue: 'resultRows',
          })
          .shift(),
      ) as T
    },
    exec: async (sql: string, params?: DatabaseBindParams) => {
      await loadAdapter(collection)
      await db.exec({ sql, bind: params })
    },
  }
}

async function initializeDatabase() {
  if (!db) {
    const sqlite3InitModule = await import('@sqlite.org/sqlite-wasm').then(m => m.default)
    // @ts-expect-error sqlite3ApiConfig is not defined in the module
    globalThis.sqlite3ApiConfig = {
      silent: true,
      debug: (...args: unknown[]) => console.debug(...args),
      warn: (...args: unknown[]) => {
        if (String(args[0]).includes('OPFS sqlite3_vfs')) return
        console.warn(...args)
      },
      error: (...args: unknown[]) => console.error(...args),
      log: (...args: unknown[]) => console.log(...args),
    }
    const sqlite3 = await sqlite3InitModule()
    db = new sqlite3.oo1.DB() // in-memory
  }
  return db
}

/* ---------- self-heal helpers ---------- */

function encEnabled(): boolean {
  const pub = useRuntimeConfig().public as unknown as { content?: { encryptionEnabled?: boolean } }
  return !!pub?.content?.encryptionEnabled
}

function buildId(): string {
  const pub = useRuntimeConfig().public as Record<string, unknown>
  return String((pub && (pub as any).buildId) || '0')
}

function shouldSelfHeal(e: unknown): boolean {
  const msg = String((e as any)?.message || e)
  const status = Number((e as any)?.statusCode || (e as any)?.response?.status || 0)
  const httpBad = [401, 403, 404].includes(status)
  const decryptish = /decrypt|aes|gcm|operationerror|checksum|invalid key|ciphertext|data length/i.test(msg)
  return httpBad || decryptish
}

function healFlagKey(collection: string) {
  return `content:selfheal:done:${collection}`
}

function purgeLocalCollectionCache(collection: string) {
  try {
    localStorage.removeItem(`content_checksum_${collection}`)
    localStorage.removeItem(`content_collection_${collection}`)
    // Optional: if you want to clear all collections:
    // for (const k of Object.keys(localStorage)) {
    //   if (k.startsWith('content_checksum_') || k.startsWith('content_collection_')) {
    //     localStorage.removeItem(k)
    //   }
    // }
  } catch {}
}

async function resetInMemoryTableAndChecksum(collection: string, checksumId: string) {
  try {
    await db.exec({ sql: `DROP TABLE IF EXISTS ${tables[String(collection)]}` })
  } catch {}
  try {
    await db.exec({ sql: `DELETE FROM ${tables.info} WHERE id = '${checksumId}'` })
  } catch {}
}

/* ---------- main loader with self-heal ---------- */

async function loadCollectionDatabase<T>(collection: T) {
  // Skip in preview mode
  if (window.sessionStorage.getItem('previewToken')) return db

  const collectionName = String(collection)
  const checksumId = `checksum_${collectionName}`
  const dumpId = `collection_${collectionName}`

  // Check current DB checksum
  let checksumState: 'matched' | 'mismatch' | 'missing' = 'matched'
  try {
    const dbChecksum = db
      .exec({
        sql: `SELECT * FROM ${tables.info} WHERE id = '${checksumId}'`,
        rowMode: 'object',
        returnValue: 'resultRows',
      })
      .shift()
    if (dbChecksum?.version !== checksums[collectionName]) checksumState = 'mismatch'
  } catch {
    checksumState = 'missing'
  }

  if (checksumState === 'matched') return db

  // A small inner function to get the dump (optionally forcing network)
  async function getCompressedDump(forceNetwork: boolean): Promise<string> {
    if (!import.meta.dev && !forceNetwork) {
      const localVer = localStorage.getItem(`content_${checksumId}`)
      if (localVer === checksums[collectionName]) {
        const cached = localStorage.getItem(`content_${dumpId}`)
        if (cached) return cached
      }
    }
    // Force fresh network fetch
    const fresh = await fetchDatabase(undefined, collectionName)
    if (!import.meta.dev) {
      try {
        localStorage.setItem(`content_${checksumId}`, checksums[collectionName]!)
        localStorage.setItem(`content_${dumpId}`, fresh!)
      } catch (error) {
        console.error('Database integrity check failed, rebuilding database', error)
      }
    }
    return fresh
  }

  async function hydrateFromCompressed(compressed: string) {
    const dump = encEnabled()
      ? await (async () => {
          const { k } = await fetchDumpKey(undefined, collectionName)
          return await decryptAndDecompressSQLDump(compressed, k)
        })()
      : decompressSQLDump(compressed)

    // Freshen table + (if needed) clear old checksum row before applying new dump
    await db.exec({ sql: `DROP TABLE IF EXISTS ${tables[collectionName]}` })
    if (checksumState === 'mismatch') {
      await db.exec({ sql: `DELETE FROM ${tables.info} WHERE id = '${checksumId}'` })
    }

    for (const command of dump) {
      try {
        await db.exec(command)
      } catch (error) {
        console.error('Error executing command', error)
      }
    }
  }

  // First attempt (use cache if valid)
  try {
    const compressedDump = await getCompressedDump(false)
    await hydrateFromCompressed(compressedDump)
    return db
  } catch (e) {
    // Self-heal once per build+collection, only for decrypt/HTTP/cache issues
    if (shouldSelfHeal(e) && !sessionStorage.getItem(healFlagKey(collectionName))) {
      sessionStorage.setItem(healFlagKey(collectionName), '1')
      // Purge just this collection’s local cache and in-memory table+checksum
      purgeLocalCollectionCache(collectionName)
      await resetInMemoryTableAndChecksum(collectionName, checksumId)

      // Retry from network (ignore local cache)
      const compressedDump = await getCompressedDump(true)
      try {
        await hydrateFromCompressed(compressedDump)
        return db
      } catch (e2) {
        console.error('Self-heal retry failed:', e2)
        throw e2
      }
    }

    console.error('Failed to load collection database:', e)
    throw e
  }
}