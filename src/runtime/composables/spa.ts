import type { Storage } from 'unstorage'
import LSDriver from 'unstorage/drivers/localstorage'
import { createStorage, prefixStorage } from 'unstorage'
import { createPipelineFetcher } from '../query/match/pipeline'
import { createQuery } from '../query/query'

export const contentStorage = prefixStorage(createStorage({ driver: LSDriver() }), '@content')

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

let contentDatabase
export async function useContentDatabase () {
  if (!contentDatabase) {
    const { contents, navigation } = await $fetch(withContentBase('cache'))
    contentDatabase = createDB(contentStorage)

    for (const content of contents) {
      await contentDatabase.storage.setItem(content._id, content)
    }

    await contentDatabase.storage.setItem('navigation.json', navigation)
  }
  return contentDatabase
}
