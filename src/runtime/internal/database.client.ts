import type { Database } from '@sqlite.org/sqlite-wasm'
import { decompressSQLDump } from './dump'
import { refineContentFields } from './collection'
import { fetchDatabase } from './api'
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
      dbPromises[String(collection)] = dbPromises[String(collection)] || loadCollectionDatabase(collection)
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
        .exec({ sql, bind: params, rowMode: 'object', returnValue: 'resultRows' })
        .map(row => refineContentFields(sql, row) as T)
    },
    first: async <T>(sql: string, params?: DatabaseBindParams) => {
      await loadAdapter(collection)

      return refineContentFields(
        sql,
        db
          .exec({ sql, bind: params, rowMode: 'object', returnValue: 'resultRows' })
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
  return db
}

async function loadCollectionDatabase<T>(collection: T) {
  // Do not initialize database with dump for preview mode
  if (window.sessionStorage.getItem('previewToken')) {
    return db
  }

  let compressedDump: string | null = null

  const checksumId = `checksum_${collection}`
  const dumpId = `collection_${collection}`
  let checksumState = 'matched'
  try {
    const dbChecksum = db.exec({ sql: `SELECT * FROM ${tables.info} where id = '${checksumId}'`, rowMode: 'object', returnValue: 'resultRows' })
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

    const dump = await decompressSQLDump(compressedDump!)

    await db.exec({ sql: `DROP TABLE IF EXISTS ${tables[String(collection)]}` })
    if (checksumState === 'mismatch') {
      await db.exec({ sql: `DELETE FROM ${tables.info} WHERE id = '${checksumId}'` })
    }

    for (const command of dump) {
      try {
        await db.exec(command)
      }
      catch (error) {
        console.error('Error executing command', error)
      }
    }
  }

  return db
}
