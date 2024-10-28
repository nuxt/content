import pg, { type QueryConfigValues } from 'pg'
import { createDatabaseAdapter } from '../internal/database-adapter'

export type PostgreSqlOptions = { url: string } | pg.ClientConfig

let _client: undefined | pg.Client | Promise<pg.Client>
export default createDatabaseAdapter<PostgreSqlOptions>((opts = {}) => {
  function getClient() {
    if (_client) {
      return _client
    }
    const url = 'url' in opts
      ? (
          opts?.url?.startsWith('process.env.')
            ? process.env[opts?.url?.replace('process.env.', '')]
            : opts?.url
        )
      : ''

    const client = new pg.Client(url ? url : opts as pg.ClientConfig)
    _client = client.connect().then(() => {
      _client = client
      return _client
    })
    return _client
  }
  return {
    async all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]> {
      const db = await getClient()
      const { rows } = params ? await db.query<T[], T>(sql, params as QueryConfigValues<T>) : await db.query<T[], T>(sql)
      return rows as T[]
    },
    async first<T>(sql: string, params?: Array<number | string | boolean>) {
      const db = await getClient()
      const { rows } = params ? await db.query<T[], T>(sql, params as QueryConfigValues<T>) : await db.query<T[], T>(sql)
      return rows[0]
    },
    async exec(sql: string): Promise<void> {
      const db = await getClient()
      await db.query(sql)
    },
  }
})
