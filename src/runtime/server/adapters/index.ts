import createSqliteAdapter from './sqlite'
import type { DatabaseAdapter } from './factory'
import { useRuntimeConfig } from '#imports'
import { collections } from '#content-v3/collections'

export default function useContentDatabase() {
  const config = useRuntimeConfig().contentv3

  let adapter: DatabaseAdapter
  async function loadAdapter() {
    if (!adapter) {
      if (['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string) || config.db === 'builtin') {
        adapter = await createSqliteAdapter()
      }
      else if (config.db === 'd1') {
        adapter = await import('./d1').then(m => m.default())
      }
      else {
        adapter = await createSqliteAdapter()
      }
    }
    return adapter
  }

  function collectionJsonFields(sql: string): string[] {
    const table = sql.match(/FROM\s+(\w+)/)
    if (!table) {
      return []
    }
    return collections.find((c: { name: string }) => c.name === table[1])?.jsonFields || []
  }

  return <DatabaseAdapter>{
    all: async (sql, params) => {
      !adapter && (await loadAdapter())
      const result = await adapter.all<Record<string, unknown>>(sql, params)

      if (!result) {
        return []
      }
      return result.map((item) => {
        const jsonFields = collectionJsonFields(sql)
        for (const key of jsonFields) {
          if (item[key]) {
            item[key] = item[key] && item[key] !== 'undefined' ? JSON.parse(item[key] as string) : item[key]
          }
        }
        return item
      })
    },
    first: async (sql, params) => {
      !adapter && (await loadAdapter())
      const item = await adapter.first<Record<string, unknown>>(sql, params)

      if (!item) {
        return item
      }

      const jsonFields = collectionJsonFields(sql)
      for (const key of jsonFields) {
        if (item[key]) {
          item[key] = item[key] && item[key] !== 'undefined' ? JSON.parse(item[key] as string) : item[key]
        }
      }
      return item
    },
    exec: async (sql) => {
      !adapter && (await loadAdapter())
      return adapter.exec(sql)
    },
  }
}
