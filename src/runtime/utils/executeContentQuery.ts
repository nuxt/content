import type { Database } from '@sqlite.org/sqlite-wasm'
import type { Collections } from '@farnabaz/content-next'
import { decompressSQLDump } from './internal/decompressSQLDump'
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

async function queryContentSqlClientWasm<T>(_collection: keyof Collections, sql: string) {
  if (!db) {
    const config = useRuntimeConfig().public.contentv3
    const localCacheVersion = window.localStorage.getItem('contentv3-integrity-version')

    let compressedDump: string | null = (localCacheVersion === config.integrityVersion)
      ? window.localStorage.getItem('contentv3-dump')
      : null

    if (!compressedDump) {
      console.log('[BROWSER] Downloading database...')
      compressedDump = await $fetch('/api/database', { responseType: 'text', query: { v: config.integrityVersion } })
      try {
        window.localStorage.setItem('contentv3-integrity-version', config.integrityVersion)
        window.localStorage.setItem('contentv3-dump', compressedDump!)
      }
      catch (error) {
        console.log('Database integrity check failed, rebuilding database', error)
      }
    }

    const dump = await decompressSQLDump(compressedDump!)

    console.log('[BROWSER] Loading SQLite...')
    const sqlite3InitModule = await import('@sqlite.org/sqlite-wasm').then(m => m.default)
    const sqlite3 = await sqlite3InitModule()

    console.log('[BROWSER] Loading database...')
    db = new sqlite3.oo1.DB()
    for (const command of dump) {
      await db.exec(command)
    }
  }

  console.log('[BROWSER] Executing query...')
  const res = await new Promise((resolve, reject) => {
    db.exec({
      sql,
      rowMode: 'object',
      returnValue: 'resultRows',
      callback: (rows) => {
        if (Array.isArray(rows)) {
          rows = rows.map((row) => {
            return {
              ...row,
              body: row.body ? JSON.parse(row.body) : null,
            }
          })
        }

        rows = {
          ...rows,
          body: rows.body ? JSON.parse(rows.body) : null,
        }

        resolve([rows])
      },
      error: (err) => {
        reject(err)
      },
    })
  })

  return res as T[]
}
