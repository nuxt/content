import type { Database } from '@sqlite.org/sqlite-wasm'
import type { DatabaseAdapter, DatabaseBindParams } from '@nuxt/content'
import { decompressSQLDump } from './dump'
import { refineRetrivedDocument } from './collection'
import { fetchDatabase } from './api'
import { checksums, tables } from '#content/manifest'

let db: Database

export function loadDatabaseAdapter<T>(collection: T): DatabaseAdapter {
  return {
    all: async <T>(sql: string, params: DatabaseBindParams) => {
      await loadAdapter(collection)

      return db
        .exec({ sql, bind: params, rowMode: 'object', returnValue: 'resultRows' })
        .map(row => refineRetrivedDocument(sql, row) as T)
    },
    first: async <T>(sql: string, params: DatabaseBindParams) => {
      await loadAdapter(collection)

      return refineRetrivedDocument(
        sql,
        db
          .exec({ sql, bind: params, rowMode: 'object', returnValue: 'resultRows' })
          .shift(),
      ) as T
    },
    exec: async (sql: string) => {
      await loadAdapter(collection)

      await db.exec({ sql })
    },
  }
}

async function loadAdapter<T>(collection: T) {
  if (!db) {
    const sqlite3InitModule = await import('@sqlite.org/sqlite-wasm').then(m => m.default)
    const sqlite3 = await sqlite3InitModule()
    db = new sqlite3.oo1.DB()
  }

  // Do not initialize database with dump for Studio preview
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
          window.localStorage.setItem(`content_${checksumId}`, checksums[String(collection)])
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
