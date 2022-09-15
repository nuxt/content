import type { Storage } from 'unstorage'
import LSDriver from 'unstorage/drivers/localstorage'
import { createStorage, prefixStorage } from 'unstorage'
import { createPipelineFetcher } from '../query/match/pipeline'
import { createQuery } from '../query/query'
import { ParsedContentMeta, QueryBuilderParams } from '../types'
import { createNav } from '../server/navigation'

export const contentStorage = prefixStorage(createStorage({ driver: LSDriver() }), '@content')

export function createDB (storage: Storage) {
  async function getItems () {
    const keys = await storage.getKeys()
    return await Promise.all(keys.map(key => storage.getItem(key)))
  }
  return {
    storage,
    fetch: createPipelineFetcher(getItems),
    query: (query?: QueryBuilderParams) => createQuery(createPipelineFetcher(getItems), query)
  }
}

let contentDatabase
export async function useContentDatabase () {
  if (!contentDatabase) {
    contentDatabase = createDB(contentStorage)
    const iv = await contentDatabase.storage.getItem('integrity')
    if (useRuntimeConfig().public.content.spa.iv !== +iv) {
      const { contents, navigation } = await $fetch(withContentBase('cache.json'))

      for (const content of contents) {
        await contentDatabase.storage.setItem(content._id, content)
      }

      await contentDatabase.storage.setItem('navigation', navigation)

      await contentDatabase.storage.setItem('integrity', useRuntimeConfig().content.spa.iv)
    }
  }
  return contentDatabase
}

export async function generateNavigation (query) {
  const db = await useContentDatabase()

  if (!query || Object.keys(query).length === 0) {
    return db.storage.getItem('navigation')
  }

  const contents = await db.query(query)
    .where({
    /**
     * Partial contents are not included in the navigation
     * A partial content is a content that has `_` prefix in its path
     */
      _partial: false,
      /**
     * Exclude any pages which have opted out of navigation via frontmatter.
     */
      navigation: {
        $ne: false
      }
    })
    .find()

  const dirConfigs = await db.query().where({ _path: /\/_dir$/i, _partial: true }).find()

  const configs = dirConfigs.reduce((configs, conf) => {
    if (conf.title.toLowerCase() === 'dir') {
      conf.title = undefined
    }
    const key = conf._path.split('/').slice(0, -1).join('/') || '/'
    configs[key] = {
      ...conf,
      // Extract meta from body. (non MD files)
      ...conf.body
    }
    return configs
  }, {} as Record<string, ParsedContentMeta>)

  return createNav(contents as ParsedContentMeta[], configs)
}
