import Database from 'better-sqlite3'
import type { DevtoolsServerContext, ServerFunctions } from '../../types'

export function setupSqliteRPC({ options }: DevtoolsServerContext) {
  const db = new Database(options._localDatabase.filename, {
    readonly: true,
  })

  return {
    async sqliteTables() {
      const tables = db
        .prepare(
          'SELECT name FROM sqlite_master WHERE type=\'table\' AND name NOT LIKE \'sqlite_%\';',
        )
        .all()

      if (!tables.length) {
        return []
      }

      return tables as { name: string }[]
    },

    async sqliteTable(table: string) {
      const rows = db.prepare(`SELECT * FROM ${table}`).all()
      return rows
    },
    async sqliteTableCreate() {
      return new Promise(() => 1)
    },
    async sqliteTableDrop() {
      return new Promise(() => 1)
    },
  } satisfies Partial<ServerFunctions>
}
