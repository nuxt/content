import type { D1Database } from '@cloudflare/workers-types/experimental'
import { createDatabaseAdapter } from '../../internal/database-adapter'

let db: D1Database
export default createDatabaseAdapter<{ binding: string }>((opts) => {
  const binding = opts?.binding || 'DB'
  if (!db) {
    // @ts-expect-error - D1 doesn't have a global variable
    db = process.env?.[binding] || globalThis.__env__?.[binding] || globalThis?.[binding]
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
