import type { Database } from '@sqlite.org/sqlite-wasm'
import type { Collections } from '@farnabaz/content-next'
import { useRuntimeConfig } from '#imports'

export async function executeContentQuery<T extends keyof Collections, Result = Collections[T]>(collection: T, sql: string) {
  let result: Array<Result>
  if (import.meta.client && useRuntimeConfig().public.contentv3.clientDB?.enabled) {
    result = await queryContentSqlWasm<Result>(collection, sql)
  }
  else {
    result = await queryContentSqlApi<Result>(collection, sql)
  }

  return result
}

function queryContentSqlApi<T>(collection: keyof Collections, sql: string) {
  return $fetch(`/api/${String(collection)}/query?q=${encodeURIComponent(sql)}`) as Promise<T[]>
}

let db: Database

async function queryContentSqlWasm<T>(_collection: keyof Collections, sql: string) {
  if (!db) {
    console.log('[BROWSER] Loading SQLite...')
    const sqlite3InitModule = await import('@sqlite.org/sqlite-wasm').then(m => m.default)
    const sqlite3 = await sqlite3InitModule()

    console.log('[BROWSER] Downloading database...')

    const contentDumps = await $fetch('/api/database') as string[]

    console.log('[BROWSER] Loading database...')
    db = new sqlite3.oo1.DB()
    for (const dump of contentDumps) {
      await db.exec(dump)
    }
  }
  else {
    console.log('[BROWSER] Using cached database...')
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
