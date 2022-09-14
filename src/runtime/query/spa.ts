import type { Storage, StorageValue } from 'unstorage'
import { createPipelineFetcher } from './match/pipeline'
import { createQuery } from './query'

// TODO: replace with unstorage and localstorage driver
export const LSStorage: any = {
  hasItem: function (key: string): Promise<boolean> {
    return Promise.resolve(window.localStorage.getItem(key) !== null)
  },
  getItem: function (key: string): Promise<StorageValue> {
    return Promise.resolve(JSON.parse(window.localStorage.getItem(key)))
  },
  setItem: function (key: string, value: StorageValue): Promise<void> {
    window.localStorage.setItem(key, JSON.stringify(value))
    return Promise.resolve()
  },
  removeItem: function (key: string, _removeMeta?: boolean): Promise<void> {
    window.localStorage.removeItem(key)
    return Promise.resolve()
  },
  getKeys: function (_base?: string): Promise<string[]> {
    return Promise.resolve(Object.keys(window.localStorage).filter(key => key.startsWith('content:')))
  },
  clear: function (_base?: string): Promise<void> {
    const keys = Object.keys(window.localStorage).filter(key => key.startsWith('content:'))
    for (const key of keys) {
      window.localStorage.removeItem(key)
    }
    return Promise.resolve()
  }
}

export function createDB (storage: Storage) {
  async function getItems () {
    const keys = await storage.getKeys()
    return await Promise.all(keys.map(key => storage.getItem(key)))
  }
  return {
    storage,
    fetch: createPipelineFetcher(getItems),
    query: () => createQuery(createPipelineFetcher(getItems))
  }
}

let spaDatabase
export async function useContentDatabase () {
  if (!spaDatabase) {
    const { contents, navigation } = await $fetch('/api/_content/cache')
    spaDatabase = createDB(LSStorage)

    for (const content of contents) {
      await spaDatabase.storage.setItem(content._id, content)
    }

    await spaDatabase.storage.setItem('content-navigation.json', navigation)
  }
  return spaDatabase
}
