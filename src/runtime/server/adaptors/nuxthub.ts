import type { hubDatabase } from '@nuxthub/core/dist/runtime/database/server/utils/database'
import { createDatabaseAdaptor } from './factory'

let db: ReturnType<typeof hubDatabase>
export default createDatabaseAdaptor(async () => {
  if (!db) {
    db = await import('@nuxthub/core/dist/runtime/database/server/utils/database').then(m => m.hubDatabase())
  }

  return {
    async all<T>(sql: string, params?: Array<number | string | boolean>) {
      return (params ? db.prepare(sql).bind(...params).all() : db.prepare(sql).all()).then(res => res.results as T[])
    },
    async first(sql, params) {
      return params ? db.prepare(sql).bind(...params).first() : db.prepare(sql).first()
    },
    async exec<T>(sql: string) {
      return db.exec(sql.replace(/\n+/g, ' ')) as Promise<T>
    },
  }
})
