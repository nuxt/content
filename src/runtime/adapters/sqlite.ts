import Database from 'better-sqlite3'
import { isAbsolute } from 'pathe'
import { createDatabaseAdapter } from '../internal/database-adapter'

let db: Database.Database
export default createDatabaseAdapter<{ filename: string }>((opts) => {
  if (!db) {
    const filename = !opts || isAbsolute(opts?.filename || '')
      ? opts?.filename
      // @ts-expect-error - `_importMeta_` is defined in nitro runtime
      : new URL(opts.filename, globalThis._importMeta_.url).pathname
    db = new Database(filename)
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
