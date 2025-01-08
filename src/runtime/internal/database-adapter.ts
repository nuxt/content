import type { DatabaseAdapter } from '@nuxt/content'
import { refineContentFields } from './collection'

export function createDatabaseAdapter<Options = unknown>(factory: (otps: Options) => DatabaseAdapter) {
  return (opts: Options) => {
    const adapter = factory(opts)

    return <DatabaseAdapter>{
      all: async (sql, params) => {
        const result = await adapter.all<Record<string, unknown>>(sql, params)

        if (!result) {
          return []
        }
        return result.map(item => refineContentFields(sql, item))
      },
      first: async (sql, params) => {
        const item = await adapter.first<Record<string, unknown>>(sql, params)

        if (!item) {
          return item
        }

        return refineContentFields(sql, item)
      },
      exec: async (sql) => {
        return adapter.exec(sql)
      },
    }
  }
}
