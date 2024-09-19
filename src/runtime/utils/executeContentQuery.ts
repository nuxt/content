import type { Database } from '@sqlite.org/sqlite-wasm'
import type { Collections } from '@farnabaz/content-next'
import { decompressSQLDump } from './internal/decompressSQLDump'
import { measurePerformance } from './internal/performance'
import { parseJsonFields } from './internal/parseJsonFields'
import { useRuntimeConfig } from '#imports'

export async function executeContentQuery<T extends keyof Collections, Result = Collections[T]>(collection: T, sql: string) {
  let result: Array<Result>
  if (import.meta.client) {
    if (window.benchmark?.downloadCompressedDump) {
      result = await queryContentSqlClientWasm<Result>(collection, sql)
    }
    else {
      result = await queryContentSqlClientWasmDecompressed<Result>(collection, sql)
    }
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

async function queryContentSqlClientWasmDecompressed<T>(_collection: keyof Collections, sql: string) {
  const perf = measurePerformance()
  if (!db || window.benchmark?.reinitiateDatabase) {
    const config = useRuntimeConfig().public.contentv3
    const localCacheVersion = window.localStorage.getItem('contentv3-integrity-version')

    let compressedDump: string | string[] | null = window.benchmark?.cacheInLocalStorage && (localCacheVersion === config.integrityVersion)
      ? window.localStorage.getItem('contentv3-dump-sql')
      : null
    perf.tick('Get Local Cache')

    if (!compressedDump) {
      compressedDump = await $fetch<string[]>('/api/database-decompress', { responseType: 'json', query: { v: config.integrityVersion } })
      perf.tick('Download Database')
      if (window.benchmark?.cacheInLocalStorage) {
        try {
          window.localStorage.setItem('contentv3-integrity-version', config.integrityVersion)
          window.localStorage.setItem('contentv3-dump-sql', JSON.stringify(compressedDump))
        }
        catch (error) {
          console.log('Database integrity check failed, rebuilding database', error)
        }
        perf.tick('Store Database')
      }
    }

    const dump = typeof compressedDump === 'string' ? JSON.parse(compressedDump) : compressedDump
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

  const jsonFields = ['body', 'meta'] as string[]
  const res = await new Promise((resolve, reject) => {
    db.exec({
      sql,
      rowMode: 'object',
      // @ts-expect-error Types are mixed up
      returnValue: 'resultRows',
      // @ts-expect-error Types are mixed up
      callback(rows: T | T[]) {
        if (!Array.isArray(rows)) {
          rows = [rows]
        }

        resolve(rows.map(row => parseJsonFields(row, jsonFields)))
      },
      error: err => reject(err),
    })
  })
  perf.tick('Execute Query')

  console.log(perf.end('Run with Raw Dump'))
  return res as T[]
}

async function queryContentSqlClientWasm<T>(_collection: keyof Collections, sql: string) {
  const perf = measurePerformance()
  if (!db || window.benchmark?.reinitiateDatabase) {
    const config = useRuntimeConfig().public.contentv3
    const localCacheVersion = window.localStorage.getItem('contentv3-integrity-version')

    let compressedDump: string | null = window.benchmark?.cacheInLocalStorage && (localCacheVersion === config.integrityVersion)
      ? window.localStorage.getItem('contentv3-dump')
      : null
    perf.tick('Get Local Cache')

    if (!compressedDump) {
      compressedDump = await $fetch('/api/database', { responseType: 'text', query: { v: config.integrityVersion } })
      perf.tick('Download Database')
      if (window.benchmark?.cacheInLocalStorage) {
        try {
          window.localStorage.setItem('contentv3-integrity-version', config.integrityVersion)
          window.localStorage.setItem('contentv3-dump', compressedDump!)
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

  // TODO: get json fields from dump
  const jsonFields = ['body', 'meta'] as string[]
  const res = await new Promise((resolve, reject) => {
    db.exec({
      sql,
      rowMode: 'object',
      // @ts-expect-error Types are mixed up
      returnValue: 'resultRows',
      // @ts-expect-error Types are mixed up
      callback(rows: T | T[]) {
        if (!Array.isArray(rows)) {
          rows = [rows]
        }

        resolve(rows.map(row => parseJsonFields(row, jsonFields)))
      },
      error: err => reject(err),
    })
  })
  perf.tick('Execute Query')

  console.log(perf.end('Run with Compressed Dump'))

  return res as T[]
}
