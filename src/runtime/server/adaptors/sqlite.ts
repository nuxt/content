import Database from 'better-sqlite3'
import { createDatabaseAdaptor } from './factory'
import { useRuntimeConfig } from '#imports'

let db: Database
export default createDatabaseAdaptor(function () {
  const config = useRuntimeConfig().contentv3

  if (!db) {
    db = Database(config.dataDir + '/items.db')
  }

  return {
    async all(sql, params) {
      return params ? db.prepare(sql).all(params) : db.prepare(sql).all()
    },
    async first(sql, params) {
      return params ? db.prepare(sql).get(params) : db.prepare(sql).get()
    },
    async exec(sql) {
      return db.exec(sql)
    },
  }
})
