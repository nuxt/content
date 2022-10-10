import type { Storage } from 'unstorage'
// @ts-ignore
import memoryDriver from 'unstorage/drivers/memory'
import { createStorage, prefixStorage } from 'unstorage'
import { useRuntimeConfig, useCookie, useNuxtApp } from '#app'
import { withBase } from 'ufo'
import { createPipelineFetcher } from '../query/match/pipeline'
import { createQuery } from '../query/query'
import type { NavItem, ParsedContent, ParsedContentMeta, QueryBuilderParams } from '../types'
import { createNav } from '../server/navigation'

const withContentBase = url => withBase(url, '/api/' + useRuntimeConfig().public.content.base)

export const contentStorage = prefixStorage(createStorage({ driver: memoryDriver() }), '@content')

export const getPreview = () => {
  return useCookie('previewToken').value
}

export function createDB (storage: Storage) {
  async function getItems () {
    const keys = new Set(await storage.getKeys('cache:'))

    // Merge preview items
    const previewToken = getPreview()
    if (previewToken) {
      // Ignore cache content if preview requires it
      const previewMeta: any = await storage.getItem(`${previewToken}$`).then(data => data || {})
      if (previewMeta.ignoreBuiltContents) {
        keys.clear()
      }

      const previewKeys = await storage.getKeys(`${previewToken}:`)
      const previewContents = await Promise.all(previewKeys.map(key => storage.getItem(key) as Promise<ParsedContent>))
      for (const pItem of previewContents) {
        keys.delete(`cache:${pItem._id}`)
        if (!pItem.__deleted) {
          keys.add(`${previewToken}:${pItem._id}`)
        }
      }
    }
    const items = await Promise.all(Array.from(keys).map(key => storage.getItem(key) as Promise<ParsedContent>))
    return items
  }
  return {
    storage,
    fetch: createPipelineFetcher(getItems),
    query: (query?: QueryBuilderParams) => createQuery(createPipelineFetcher(getItems), query)
  }
}

let contentDatabase
let contentDatabaseInitPromise
export async function useContentDatabase () {
  if (contentDatabaseInitPromise) {
    await contentDatabaseInitPromise
  } else if (!contentDatabase) {
    contentDatabaseInitPromise = initContentDatabase()
    contentDatabase = await contentDatabaseInitPromise
  }
  return contentDatabase
}

/**
 * Initialize content database
 * - Fetch content from cache api
 * - Call `content:storage` hook to allow plugins to fill storage
 */
async function initContentDatabase () {
  const nuxtApp = useNuxtApp()
  const { clientDB } = useRuntimeConfig().public.content

  const _contentDatabase = createDB(contentStorage)
  const integrity = await _contentDatabase.storage.getItem('integrity')
  if (clientDB.integrity !== +integrity) {
    const { contents, navigation } = await $fetch(withContentBase('cache.json')) as any

    await Promise.all(
      contents.map(content => _contentDatabase.storage.setItem(`cache:${content._id}`, content))
    )

    await _contentDatabase.storage.setItem('navigation', navigation)

    await _contentDatabase.storage.setItem('integrity', clientDB.integrity)
  }

  // call `content:storage` hook to allow plugins to fill storage
  // @ts-ignore
  await nuxtApp.callHook('content:storage', _contentDatabase.storage)

  return _contentDatabase
}

export async function generateNavigation (query): Promise<Array<NavItem>> {
  const db = await useContentDatabase()

  if (!getPreview() && Object.keys(query || {}).length === 0) {
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
