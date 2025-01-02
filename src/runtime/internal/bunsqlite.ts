import { isAbsolute } from 'pathe'
import type { Database as BunDatabaseType } from 'bun:sqlite'

function getBunDatabaseSync() {
  // A top level import will make Nuxt complain about a missing module
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('bun:sqlite').Database
}

let db: BunDatabaseType
export const getBunSqliteDatabaseAdapter = (opts: { filename: string }) => {
  const Database = getBunDatabaseSync()
  if (!db) {
    const filename = !opts || isAbsolute(opts?.filename || '') || opts?.filename === ':memory:'
      ? opts?.filename
      : new URL(opts.filename, (globalThis as unknown as { _importMeta_: { url: string } })._importMeta_.url).pathname
    db = new Database(filename, { create: true })
  }

  return {
    async all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]> {
      return params ? db.prepare(sql).all(...params) as T[] : db.prepare(sql).all() as T[]
    },
    async first<T>(sql: string, params?: Array<number | string | boolean>): Promise<T | null> {
      return params ? db.prepare(sql).get(...params) as T : db.prepare(sql).get() as T
    },
    async exec(sql: string): Promise<unknown> {
      return db.prepare(sql).run()
    },
  }
}
