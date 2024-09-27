import type { Database } from '@sqlite.org/sqlite-wasm'
import type { Collections } from '@farnabaz/content-next'
import { decompressSQLDump } from './internal/decompressSQLDump'
import { measurePerformance } from './internal/performance'
import { parseJsonFields } from './internal/parseJsonFields'
import { useRuntimeConfig } from '#imports'

export async function executeContentQuery<T extends keyof Collections, Result = Collections[T]>(collection: T, sql: string) {
  let result: Array<Result>
  if (import.meta.client) {
    result = await queryContentSqlClientWasm<Result>(collection, sql)
  }
  else {
    result = await queryContentSqlApi<Result>(collection, sql)
  }

  return result
}

function queryContentSqlApi<T>(collection: keyof Collections, sql: string) {
  return $fetch<T[]>(`/api/${String(collection)}/query`, {
    method: 'POST',
    body: {
      query: sql,
    },
  })
}

let db: Database
let collections: Record<string, { jsonFields: string[] }> | null = null

async function queryContentSqlClientWasm<T>(collection: keyof Collections, sql: string) {
  const perf = measurePerformance()
  if (!db || !collections || window.benchmark?.reinitiateDatabase) {
    let compressedDump: string | null = null
    const config = useRuntimeConfig().public.contentv3

    if (window.benchmark?.cacheInLocalStorage) {
      const localCacheVersion = window.localStorage.getItem('contentv3-integrity-version')
      if (localCacheVersion === config.integrityVersion) {
        compressedDump = window.localStorage.getItem('contentv3-dump')
        const localCollections = window.localStorage.getItem('contentv3-collections')
        if (localCollections) {
          collections = JSON.parse(localCollections)
        }
      }
    }

    perf.tick('Get Local Cache')
    if (!compressedDump || !collections) {
      const response = await $fetch('/api/database.json', {
        headers: { 'content-type': 'application/json' },
        query: { v: config.integrityVersion },
      })
      compressedDump = response.dump
      collections = response.collections as unknown as Record<string, { jsonFields: string[] }>

      perf.tick('Download Database')
      if (window.benchmark?.cacheInLocalStorage) {
        try {
          window.localStorage.setItem('contentv3-integrity-version', config.integrityVersion)
          window.localStorage.setItem('contentv3-dump', compressedDump!)
          window.localStorage.setItem('contentv3-collections', JSON.stringify(collections))
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
  }

  const jsonFields = collections?.[collection]?.jsonFields || ['body', 'meta'] as string[]
  const rows = db
    .exec({ sql, rowMode: 'object', returnValue: 'resultRows' })
    .map(row => parseJsonFields(row, jsonFields))

  perf.tick('Execute Query')

  console.log(perf.end('Run with Compressed Dump'))

  return rows as T[]
}
