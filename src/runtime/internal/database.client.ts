import { useRuntimeConfig } from '#imports'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { decompressSQLDump, decryptAndDecompressSQLDump } from './dump'
import { refineContentFields } from './collection'
import { fetchDatabase, fetchDumpKey } from './api'
import type { DatabaseAdapter, DatabaseBindParams, ClearContentClientStorageOptions } from '@nuxt/content'
import { checksums, tables } from '#content/manifest'

function extractKidFromEnvelope(b64: string | null): string | null {
  if (!b64) return null
  try {
    // Envelopes are base64-encoded JSON. Decode and look for a `kid` field.
    const decoded = atob(b64)
    const m = decoded.match(/"kid"\s*:\s*"([^"]+)"/)
    return m ? (m[1] ?? null) : null
  }
  catch {
    return null
  }
}

let db: Database | null = null
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
      dbPromises[String(collection)] = dbPromises[String(collection)] || loadCollectionDatabase(collection)
      await dbPromises[String(collection)]
      loadedCollections[String(collection)] = 'loaded'
      Reflect.deleteProperty(dbPromises, String(collection))
    }

    return db as Database
  }

  return {
    all: async <T>(sql: string, params?: DatabaseBindParams) => {
      await loadAdapter(collection)

      const activeDb = db
      if (!activeDb) {
        throw new Error('Client content database is not initialized')
      }

      return activeDb
        .exec({ sql, bind: params, rowMode: 'object', returnValue: 'resultRows' })
        .map(row => refineContentFields(sql, row) as T)
    },
    first: async <T>(sql: string, params?: DatabaseBindParams) => {
      await loadAdapter(collection)

      const activeDb = db
      if (!activeDb) {
        throw new Error('Client content database is not initialized')
      }

      return refineContentFields(
        sql,
        activeDb
          .exec({ sql, bind: params, rowMode: 'object', returnValue: 'resultRows' })
          .shift(),
      ) as T
    },
    exec: async (sql: string, params?: DatabaseBindParams) => {
      await loadAdapter(collection)

      const activeDb = db
      if (!activeDb) {
        throw new Error('Client content database is not initialized')
      }

      await activeDb.exec({ sql, bind: params })
    },
  }
}

async function initializeDatabase(): Promise<Database> {
  if (!db) {
    const sqlite3InitModule = await import('@sqlite.org/sqlite-wasm').then(m => m.default)
    // @ts-expect-error sqlite3ApiConfig is not defined in the module
    globalThis.sqlite3ApiConfig = {
      // overriding default log function allows to avoid error when logger are dropped in build.
      // For example `nuxt-security` module drops logger in production build by default.
      silent: true,
      debug: (...args: unknown[]) => console.debug(...args),
      warn: (...args: unknown[]) => {
        if (String(args[0]).includes('OPFS sqlite3_vfs')) {
          return
        }
        console.warn(...args)
      },
      error: (...args: unknown[]) => console.error(...args),
      log: (...args: unknown[]) => console.log(...args),
    }
    const sqlite3 = await sqlite3InitModule()
    db = new sqlite3.oo1.DB()
  }
  return db as Database
}

async function loadCollectionDatabase<T>(collection: T): Promise<Database> {
  const activeDb = db
  if (!activeDb) {
    throw new Error('Client content database is not initialized')
  }
  // Do not initialize database with dump for preview mode
  if (window.sessionStorage.getItem('previewToken')) {
    return activeDb
  }

  let compressedDump: string | null = null

  const checksumId = `checksum_${collection}`
  const dumpId = `collection_${collection}`
  let checksumState = 'matched'
  try {
    const dbChecksum = activeDb.exec({ sql: `SELECT * FROM ${tables.info} where id = '${checksumId}'`, rowMode: 'object', returnValue: 'resultRows' })
      .shift()

    if (dbChecksum?.version !== checksums[String(collection)]) {
      checksumState = 'mismatch'
    }
  }
  catch {
    checksumState = 'missing'
  }

  if (checksumState !== 'matched') {
    if (!import.meta.dev) {
      const localCacheVersion = window.localStorage.getItem(`content_${checksumId}`)
      if (localCacheVersion === checksums[String(collection)]) {
        compressedDump = window.localStorage.getItem(`content_${dumpId}`)
      }
    }

    if (!compressedDump) {
      compressedDump = await fetchDatabase(undefined, String(collection))
      if (!import.meta.dev) {
        try {
          window.localStorage.setItem(`content_${checksumId}`, checksums[String(collection)]!)
          window.localStorage.setItem(`content_${dumpId}`, compressedDump!)
        }
        catch (error) {
          console.error('Database integrity check failed, rebuilding database', error)
        }
      }
    }

    const encEnabled = !!(
      useRuntimeConfig().public as unknown as { content?: { encryptionEnabled?: boolean } }
    )?.content?.encryptionEnabled

    const dump = await (encEnabled
      ? (async () => {
          const kid = extractKidFromEnvelope(compressedDump!)

          // 1) Try cached derived key first (enables offline reads)
          if (kid) {
            try {
              const cachedK = window.localStorage.getItem(`content_key_${kid}`)
              if (cachedK) {
                try {
                  const ok = await decryptAndDecompressSQLDump(compressedDump!, cachedK)
                  // Decryption worked with cached key
                  return ok
                }
                catch {
                  // Cached key is stale — purge it and continue to fetch a fresh one
                  try {
                    window.localStorage.removeItem(`content_key_${kid}`)
                  }
                  catch (purgeErr) {
                    console.debug?.('[content] could not remove stale cached key', purgeErr)
                  }
                }
              }
            }
            catch (readErr) {
              console.debug?.('[content] reading cached key failed', readErr)
            }
          }

          // 2) No (working) cached key — fetch using kid when available (source of truth = envelope)
          try {
            const { k } = await fetchDumpKey(undefined, String(collection), kid || undefined)
            const result = await decryptAndDecompressSQLDump(compressedDump!, k)
            // Cache the derived key for offline use, keyed by kid
            if (kid) {
              try {
                window.localStorage.setItem(`content_key_${kid}`, k)
              }
              catch (cacheKeyErr) {
                console.debug?.('[content] failed to cache derived key for offline use', cacheKeyErr)
              }
            }
            return result
          }
          catch (e) {
            console.error('Failed to decrypt encrypted dump (first attempt):', e)

            // Minimal self-heal: wipe only this collection’s local cache
            try {
              window.localStorage.removeItem(`content_${checksumId}`)
              window.localStorage.removeItem(`content_${dumpId}`)
              if (kid) {
                try {
                  window.localStorage.removeItem(`content_key_${kid}`)
                }
                catch (purgeKeyErr) {
                  console.debug?.('[content] failed to remove cached derived key', purgeKeyErr)
                }
              }
            }
            catch (purgeErr) {
              console.debug?.('[content] decrypt retry: localStorage cleanup failed', purgeErr)
            }

            // Force-refetch a fresh dump + key, bypassing stale local cache
            try {
              compressedDump = await fetchDatabase(undefined, String(collection))
              if (!import.meta.dev) {
                try {
                  window.localStorage.setItem(`content_${checksumId}`, checksums[String(collection)]!)
                  window.localStorage.setItem(`content_${dumpId}`, compressedDump!)
                }
                catch (cacheErr) {
                  console.error('Database integrity check failed while caching refreshed dump', cacheErr)
                }
              }
              const kid2 = extractKidFromEnvelope(compressedDump!)
              const { k: k2 } = await fetchDumpKey(undefined, String(collection), kid2 || undefined)
              const ok2 = await decryptAndDecompressSQLDump(compressedDump!, k2)
              if (kid2) {
                try {
                  window.localStorage.setItem(`content_key_${kid2}`, k2)
                }
                catch (cacheKeyErr) {
                  console.debug?.('[content] failed to cache derived key for offline use', cacheKeyErr)
                }
              }
              return ok2
            }
            catch (e2) {
              console.error('Failed to decrypt encrypted dump (after local purge & refetch):', e2)
              throw e2
            }
          }
        })()
      : decompressSQLDump(compressedDump!))

    await activeDb.exec({ sql: `DROP TABLE IF EXISTS ${tables[String(collection)]}` })
    if (checksumState === 'mismatch') {
      await activeDb.exec({ sql: `DELETE FROM ${tables.info} WHERE id = '${checksumId}'` })
    }

    for (const command of dump) {
      try {
        await activeDb.exec(command)
      }
      catch (error) {
        console.error('Error executing command', error)
      }
    }
  }

  return activeDb
}

export async function clearClientStorage<T>(options: ClearContentClientStorageOptions<T> = {}) {
  if (!import.meta.client) {
    return
  }

  const targets = options.collections?.length
    ? Array.from(new Set(options.collections.map(collection => String(collection))))
    : Object.keys(checksums)

  const removeLocalStorageItem = (key: string) => {
    try {
      window.localStorage.removeItem(key)
    }
    catch (err) {
      console.debug?.('[content] failed to remove localStorage item', key, err)
    }
  }

  const activeDb = db

  for (const collection of targets) {
    const checksumId = `content_checksum_${collection}`
    const dumpId = `content_collection_${collection}`
    removeLocalStorageItem(checksumId)
    removeLocalStorageItem(dumpId)

    Reflect.deleteProperty(loadedCollections, collection)
    Reflect.deleteProperty(dbPromises, collection)

    if (activeDb) {
      const tableName = tables[String(collection)]
      if (tableName) {
        try {
          await activeDb.exec({ sql: `DROP TABLE IF EXISTS ${tableName}` })
        }
        catch (err) {
          console.debug?.('[content] failed to drop content table', tableName, err)
        }
      }

      try {
        await activeDb.exec({ sql: `DELETE FROM ${tables.info} WHERE id = 'checksum_${collection}'` })
      }
      catch (err) {
        console.debug?.('[content] failed to purge checksum metadata', collection, err)
      }
    }
  }

  if (options.includeDerivedKeys ?? true) {
    try {
      const derivedKeys: string[] = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key?.startsWith('content_key_')) {
          derivedKeys.push(key)
        }
      }
      for (const key of derivedKeys) {
        window.localStorage.removeItem(key)
      }
    }
    catch (err) {
      console.debug?.('[content] failed to clear cached derived keys', err)
    }
  }
}
