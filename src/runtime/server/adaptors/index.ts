import createSqliteAdaptor from './sqlite'
import type { DatabaseAdaptor } from './factory'
import { useRuntimeConfig } from '#imports'
import { collections } from '#content-v3/collections'

export default function useContentDatabase() {
  const config = useRuntimeConfig().contentv3

  let adapter: DatabaseAdaptor
  async function loadAdaptor() {
    if (!adapter) {
      if (['nitro-prerender', 'nitro-dev'].includes(import.meta.preset as string) || config.db === 'builtin') {
        adapter = await createSqliteAdaptor()
      }
      else if (config.db === 'nuxthub') {
        const createNuxhubAdaptor = await import('./nuxthub').then(module => module.default)
        adapter = await createNuxhubAdaptor()
      }
      else {
        adapter = await createSqliteAdaptor()
      }
    }
    return adapter
  }

  function collectionJsonFields(sql: string): string[] {
    const table = sql.match(/FROM\s+(\w+)/)
    if (!table) {
      return []
    }
    return collections.find(c => c.name === table[1])?.jsonFields || []
  }

  return <DatabaseAdaptor>{
    all: async (sql, params) => {
      !adapter && (await loadAdaptor())
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
      !adapter && (await loadAdaptor())
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
      !adapter && (await loadAdaptor())
      return adapter.exec(sql)
    },
  }
}
