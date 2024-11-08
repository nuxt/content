import { createClient, type Client } from '@libsql/client/web'
import { createDatabaseAdapter } from '../internal/database-adapter'

let client: Client
export default createDatabaseAdapter<{ url: string, authToken: string }>((opts) => {
  if (!client) {
    client = createClient({
      url: opts.url,
      authToken: opts.authToken,
    })
  }

  return {
    async all<T>(sql: string, params?: Array<number | string | boolean>): Promise<T[]> {
      const now = Date.now()
      const res = await client.execute({ sql, args: params || [] })
      console.log(`[all] ${res.rows.length} rows in ${Date.now() - now}ms`)
      return res.rows as T[]
    },
    async first<T>(sql: string, params?: Array<number | string | boolean>) {
      const now = Date.now()
      const res = await client.execute({ sql, args: params || [] })
      console.log(`[first] ${JSON.stringify(res.rows[0])} in ${Date.now() - now}ms`)
      return res.rows[0] as T
    },
    async exec(sql: string): Promise<void> {
      await client.execute(sql)
    },
  }
})
