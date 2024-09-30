import duckdb from 'duckdb'
import { createDatabaseAdapter } from './factory'

let db: duckdb.Database
export default createDatabaseAdapter<{ filename: string }>((opts) => {
  if (!db) {
    db = new duckdb.Database(opts!.filename! + '.duckdb')
  }

  return {
    async all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]> {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err)
          }
          resolve(rows as T[])
        })
      })
    },
    async first<T>(sql: string, params?: Array<number | string | boolean>) {
      return new Promise((resolve, reject) => {
        db.each(sql, params, (err, rows) => {
          if (err) {
            reject(err)
          }
          resolve(rows as unknown as T)
        })
      })
      // return params ? db.prepare<unknown[], T>(sql).get(params) : db.prepare<unknown[], T>(sql).get()
    },
    async exec(sql: string): Promise<void> {
      await db.exec(sql)
    },
  }
})
