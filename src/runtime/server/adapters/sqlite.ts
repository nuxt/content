import type Database from 'better-sqlite3'
import { createDatabaseAdapter } from '../../internal/database-adapter'

let db: Database.Database
export default createDatabaseAdapter<{ filename: string }>((opts) => {
  async function connect() {
    if (!db) {
      db = await import('better-sqlite3')
        .then(m => new m.default(opts?.filename))
        .catch((error) => {
          console.error('Failed to connect to database', error, opts)
          throw error
        })
    }
    return db
  }

  return {
    async all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]> {
      await connect()
      return params ? db.prepare<unknown[], T>(sql).all(params) : db.prepare<unknown[], T>(sql).all()
    },
    async first<T>(sql: string, params?: Array<number | string | boolean>) {
      await connect()
      return params ? db.prepare<unknown[], T>(sql).get(params) : db.prepare<unknown[], T>(sql).get()
    },
    async exec(sql: string): Promise<void> {
      await connect()
      await db.exec(sql)
    },
  }
})
