import createSqliteAdaptor from './sqlite'
import type { DatabaseAdaptor } from './factory'
import { useRuntimeConfig } from '#imports'

export default function useContentDatabase() {
  const config = useRuntimeConfig().contentv3

  let adapter: DatabaseAdaptor
  async function loadAdaptor() {
    if (!adapter) {
      if (['nitro-prerender', 'nitro-dev'].includes(import.meta.preset) || config.db === 'builtin') {
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

  return <DatabaseAdaptor>{
    all: async (sql, params) => {
      !adapter && (await loadAdaptor())
      const result = await adapter.all(sql, params)

      if (!result) {
        return []
      }
      return result.map((item) => {
        if (item._extension === 'yml') {
          return item.body && item.body !== 'undefined' ? JSON.parse(item.body) : null
        }

        return {
          ...item,
          body: item.body && item.body !== 'undefined' ? JSON.parse(item.body) : null,
        }
      })
    },
    first: async (sql, params) => {
      !adapter && (await loadAdaptor())
      const item = await adapter.first(sql, params)

      if (!item) {
        return null
      }
      return {
        ...item,
        body: item.body ? JSON.parse(item.body) : null,
      }
    },
    exec: async (sql) => {
      !adapter && (await loadAdaptor())
      return adapter.exec(sql)
    },
  }
}
