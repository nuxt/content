import type { Database } from '@sqlite.org/sqlite-wasm'
import { createMatch } from '../content-v2-support-utils/match'
import { createQuery } from '../content-v2-support-utils/query'
import { useRuntimeConfig } from '#imports'

export function queryContentV3(path?: string) {
  const config = useRuntimeConfig().public.contentv3
  async function fetcher(qq) {
    const match = createMatch()
    const params = qq.params()
    params.where = params.where || []
    path && params.where.unshift({ _path: path })

    // handle multiple where conditions
    const conditions = params.where?.length > 1 ? { $and: params.where } : params.where?.[0]

    const sql = conditions ? `SELECT * FROM content WHERE ${match('content', conditions)}` : `SELECT * FROM content`

    let result: Array<any>

    if (import.meta.client && config.clientDB) {
      result = await queryContentSqlWasm(sql)
    }
    else {
      result = await queryContentSqlApi(sql)
    }

    return params.first ? result[0] : result
  }
  const query = createQuery(fetcher, {})

  return query
}

function queryContentSqlApi<T>(sql: string) {
  return $fetch<T>(`/api/query?q=${encodeURIComponent(sql)}`)
}

let db: Database

async function queryContentSqlWasm(sql: string) {
  if (!db) {
    console.log('[BROWSER] Loading SQLite...')
    const sqlite3InitModule = await import('@sqlite.org/sqlite-wasm').then(m => m.default)
    const sqlite3 = await sqlite3InitModule()

    console.log('[BROWSER] Downloading database...')

    const contentDumps = await $fetch<string[]>('/api/database')

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

  return res
}
