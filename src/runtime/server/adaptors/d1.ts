import type { D1Database } from '@cloudflare/workers-types/experimental'
import { createDatabaseAdaptor } from './factory'

let db: D1Database
export default createDatabaseAdaptor(() => {
  if (!db) {
    // @ts-expect-error - missing types
    db = process.env.DB || globalThis.__env__?.DB || globalThis.DB
  }

  return {
    async all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]> {
      return (params ? db.prepare(sql).bind(...params).all() : db.prepare(sql).all())
        .then(res => res.results as T[])
    },
    async first<T>(sql: string, params?: Array<number | string | boolean>): Promise<T | null> {
      return params ? db.prepare(sql).bind(...params).first() : db.prepare(sql).first()
    },
    async exec(sql: string) {
      await db.exec(sql.replace(/\n+/g, ' '))
    },
  }
})
