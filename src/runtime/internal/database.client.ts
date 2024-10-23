import type { Database } from '@sqlite.org/sqlite-wasm'
import type { DatabaseAdapter, DatabaseBindParams } from '@nuxt/content'
import { measurePerformance } from './performance'
import { decompressSQLDump } from './dump'
import { parseJsonFields } from './collection'
import { integrityVersion } from '#content/manifest'

let db: Database

export function loadDatabaseAdapter(): DatabaseAdapter {
  return {
    all: async <T>(sql: string, params: DatabaseBindParams) => {
      if (!db) {
        await loadAdapter()
      }

      return db
        .exec({ sql, bind: params, rowMode: 'object', returnValue: 'resultRows' })
        .map(row => parseJsonFields(sql, row) as T)
    },
    first: async <T>(sql: string, params: DatabaseBindParams) => {
      if (!db) {
        await loadAdapter()
      }

      return parseJsonFields(
        sql,
        db
          .exec({ sql, bind: params, rowMode: 'object', returnValue: 'resultRows' })
          .shift(),
      ) as T
    },
    exec: async (sql: string) => {
      if (!db) {
        await loadAdapter()
      }

      await db.exec({ sql })
    },
  }
}

async function loadAdapter() {
  if (!db) {
    const perf = measurePerformance()
    let compressedDump: string | null = null

    if (!import.meta.dev) {
      const localCacheVersion = window.localStorage.getItem('content-integrity-version')
      if (localCacheVersion === integrityVersion) {
        compressedDump = window.localStorage.getItem('content-dump')
      }
    }

    perf.tick('Get Local Cache')
    if (!compressedDump) {
      compressedDump = await $fetch<string>('/api/content/database.sql', {
        responseType: 'text',
        headers: { 'content-type': 'text/plain' },
        query: { v: integrityVersion, t: import.meta.dev ? Date.now() : undefined },
      })

      perf.tick('Download Database')
      if (!import.meta.dev) {
        try {
          window.localStorage.setItem('content-integrity-version', integrityVersion)
          window.localStorage.setItem('content-dump', compressedDump!)
        }
        catch (error) {
          console.log('Database integrity check failed, rebuilding database', error)
        }
        perf.tick('Store Database')
      }
    }

    const dump = await decompressSQLDump(compressedDump!)
    perf.tick('Decompress Database')

    const sqlite3InitModule = await import('@sqlite.org/sqlite-wasm').then(m => m.default)
    const sqlite3 = await sqlite3InitModule()
    perf.tick('Import SQLite Module')

    db = new sqlite3.oo1.DB()

    for (const command of dump) {
      await db.exec(command)
    }
    perf.tick('Restore Dump')

    perf.end('Initialize Database')
  }

  return db
}
