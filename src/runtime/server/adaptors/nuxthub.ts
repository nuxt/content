import { hubDatabase } from '@nuxthub/core/dist/runtime/database/server/utils/database'
import { createDatabaseAdaptor } from './factory'

let db: ReturnType<typeof hubDatabase>
export default createDatabaseAdaptor(function () {
  if (!db) {
    db = hubDatabase()
  }

  return {
    async all<T>(sql, params) {
      return (params ? db.prepare(sql).bind(...params).all() : db.prepare(sql).all()).then(res => res.results as T[])
    },
    async first(sql, params) {
      return params ? db.prepare(sql).bind(...params).first() : db.prepare(sql).first()
    },
    async exec<T>(sql) {
      return db.exec(sql.replace(/\n+/g, ' ')) as Promise<T>
    },
  }
})
