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
let staleCachePruned = false

function activeCollections(): Set<string> {
  return new Set(Object.keys(checksums).map(String))
}

function isQuotaError(error: unknown) {
  return typeof error === 'object'
    && error !== null
    && ['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED'].includes((error as { name?: string }).name || '')
}

function pruneStaleClientCaches() {
  if (staleCachePruned || !import.meta.client) {
    return
  }

  const collections = activeCollections()
  const keysToRemove: string[] = []

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) || ''
      if (key.startsWith('content_checksum_') || key.startsWith('content_collection_')) {
        const collection = key.replace(/^content_(?:checksum_|collection_)/, '')
        if (!collections.has(collection)) {
          keysToRemove.push(key)
          keysToRemove.push(`content_checksum_${collection}`)
          keysToRemove.push(`content_collection_${collection}`)
        }
      }
      else if (key.startsWith('content_key_')) {
        // content_key_kid where kid is usually v1:<collection>:<checksum>
        const kid = key.replace(/^content_key_/, '')
        const parts = kid.split(':')
        const collection = parts.length >= 2 ? parts[1] : ''
        if (collection && !collections.has(collection)) {
          keysToRemove.push(key)
        }
      }
    }

    for (const key of new Set(keysToRemove)) {
      try {
        window.localStorage.removeItem(key)
      }
      catch {
        // Best-effort; ignore failures
      }
    }

    staleCachePruned = true
  }
  catch (err) {
    console.debug?.('[content] failed to prune stale client caches', err)
  }
}

function evictLargestCachedDump(excludeCollections: Set<string> = new Set()) {
  try {
    let largestKey: string | null = null
    let largestCollection: string | null = null
    let largestSize = -1

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) || ''
      if (!key.startsWith('content_collection_')) {
        continue
      }
      const collection = key.replace(/^content_collection_/, '')
      if (excludeCollections.has(collection)) {
        continue
      }
      const value = window.localStorage.getItem(key)
      const size = value?.length ?? 0
      if (size > largestSize) {
        largestSize = size
        largestKey = key
        largestCollection = collection
      }
    }

    if (!largestKey || !largestCollection) {
      return false
    }

    window.localStorage.removeItem(largestKey)
    window.localStorage.removeItem(`content_checksum_${largestCollection}`)
    return true
  }
  catch (err) {
    console.debug?.('[content] failed to evict cached dump', err)
    return false
  }
}

function pruneDerivedKeysForCollection(collection: string, keepChecksum?: string) {
  try {
    const targets: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) || ''
      if (!key.startsWith('content_key_')) {
        continue
      }
      const kid = key.replace(/^content_key_/, '')
      const parts = kid.split(':')
      const kidCollection = parts.length >= 2 ? parts[1] : ''
      const kidChecksum = parts.length >= 3 ? parts[2] : ''
      const keep = keepChecksum && kidChecksum === keepChecksum && kidCollection === collection
      if (kidCollection === collection && !keep) {
        targets.push(key)
      }
    }
    for (const key of targets) {
      try {
        window.localStorage.removeItem(key)
      }
      catch {
        // Best-effort; ignore failures
      }
    }
  }
  catch (err) {
    console.debug?.('[content] failed to prune derived keys', err)
  }
}

function safeSetLocalStorage(
  key: string,
  value: string,
  options: { excludeCollections?: Set<string> } = {},
): boolean {
  try {
    window.localStorage.setItem(key, value)
    return true
  }
  catch (err) {
    if (!isQuotaError(err)) {
      console.debug?.('[content] failed to cache item', key, err)
      return false
    }

    // First pass: drop stale caches (old collections, stray keys)
    pruneStaleClientCaches()
    try {
      window.localStorage.setItem(key, value)
      return true
    }
    catch (errAfterPrune) {
      if (!isQuotaError(errAfterPrune)) {
        console.debug?.('[content] failed to cache item after prune', key, errAfterPrune)
        return false
      }
      // Second pass: evict the largest cached dump (excluding current)
      if (evictLargestCachedDump(options.excludeCollections)) {
        try {
          window.localStorage.setItem(key, value)
          return true
        }
        catch (errAfterEvict) {
          console.debug?.('[content] failed to cache item after eviction', key, errAfterEvict)
          return false
        }
      }
      console.debug?.('[content] localStorage full, could not cache item', key)
      return false
    }
  }
}

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

  pruneStaleClientCaches()
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
        const exclude = new Set([String(collection)])
        safeSetLocalStorage(`content_${checksumId}`, checksums[String(collection)]!, { excludeCollections: exclude })
        safeSetLocalStorage(`content_${dumpId}`, compressedDump!, { excludeCollections: exclude })
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
              safeSetLocalStorage(`content_key_${kid}`, k, { excludeCollections: new Set([String(collection)]) })
              pruneDerivedKeysForCollection(String(collection), checksums[String(collection)]!)
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
                const exclude = new Set([String(collection)])
                safeSetLocalStorage(`content_${checksumId}`, checksums[String(collection)]!, { excludeCollections: exclude })
                safeSetLocalStorage(`content_${dumpId}`, compressedDump!, { excludeCollections: exclude })
              }
              const kid2 = extractKidFromEnvelope(compressedDump!)
              const { k: k2 } = await fetchDumpKey(undefined, String(collection), kid2 || undefined)
              const ok2 = await decryptAndDecompressSQLDump(compressedDump!, k2)
              if (kid2) {
                safeSetLocalStorage(`content_key_${kid2}`, k2, { excludeCollections: new Set([String(collection)]) })
                pruneDerivedKeysForCollection(String(collection), checksums[String(collection)]!)
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
