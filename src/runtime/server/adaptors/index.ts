import createSqliteAdaptor from './sqlite'
import { createDatabaseAdaptor } from './factory'
import { useRuntimeConfig } from '#imports'

export default createDatabaseAdaptor(() => {
  const config = useRuntimeConfig().contentv3

  let adapter
  async function loadAdaptor() {
    if (!adapter) {
      if (config.db === 'nuxthub') {
        const createNuxhubAdaptor = await import('./nuxthub').then(module => module.default)
        adapter = createNuxhubAdaptor()
      }
      else if (['nitro-prerender', 'nitro-dev'].includes(import.meta.preset) || config.db === 'builtin') {
        adapter = createSqliteAdaptor()
      }
      else {
        adapter = createSqliteAdaptor()
      }
    }
    return adapter
  }

  return {
    all: async (sql, params) => {
      !adapter && (await loadAdaptor())
      const result = await adapter.all(sql, params)

      if (!result) {
        return []
      }
      return result.map((item) => {
        return {
          ...item,
          body: item.body ? JSON.parse(item.body) : null,
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
})
