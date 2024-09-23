import Database from 'better-sqlite3'
import { createDatabaseAdapter } from './factory'

let db: Database.Database
export default createDatabaseAdapter<{ filename: string }>((opts) => {
  if (!db) {
    db = Database(opts?.filename)
  }

  return {
    async all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]> {
      return params ? db.prepare<unknown[], T>(sql).all(params) : db.prepare<unknown[], T>(sql).all()
    },
    async first<T>(sql: string, params?: Array<number | string | boolean>) {
      return params ? db.prepare<unknown[], T>(sql).get(params) : db.prepare<unknown[], T>(sql).get()
    },
    async exec(sql: string): Promise<void> {
      await db.exec(sql)
    },
  }
})
