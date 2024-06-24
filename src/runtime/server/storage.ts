import { type StorageValue, prefixStorage, type Storage } from 'unstorage'
import { joinURL, withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { hash as ohash } from 'ohash'
import type { H3Event } from 'h3'

import defu from 'defu'
import type { ParsedContent, ContentTransformer , ContentQueryBuilder, ContentQueryBuilderParams, ModuleOptions, QueryBuilderParams } from '@nuxt/content'
import { createQuery } from '../query/query'
import { transformContent } from '../transformers'
import { makeIgnored } from '../utils/config'
import { createPipelineFetcher } from '../query/match/pipeline'
import { getPreview, isPreview } from './preview'
import { getIndexedContentsList } from './content-index'
// @ts-expect-error
import { useNitroApp, useRuntimeConfig, useStorage } from '#imports'
// @ts-expect-error
import { transformers as customTransformers } from '#content/virtual/transformers'

interface ParseContentOptions {
  csv?: ModuleOptions['csv']
  yaml?: ModuleOptions['yaml']
  highlight?: ModuleOptions['highlight']
  markdown?: ModuleOptions['markdown']
  transformers?: ContentTransformer[]
  pathMeta?: {
    locales?: ModuleOptions['locales']
    defaultLocale?: ModuleOptions['defaultLocale']
    respectPathCase?: ModuleOptions['respectPathCase']
  }
  // Allow passing options for custom transformers
  [key: string]: any
}

let _sourceStorage: Storage
let _cacheStorage: Storage
let _cacheParsedStorage: Storage
export const sourceStorage = () => {
  if (!_sourceStorage) {
    _sourceStorage = prefixStorage(useStorage(), 'content:source')
  }
  return _sourceStorage
}
export const cacheStorage = () => {
  if (!_cacheStorage) {
    _cacheStorage = prefixStorage(useStorage(), 'cache:content')
  }
  return _cacheStorage
}
export const cacheParsedStorage = () => {
  if (!_cacheParsedStorage) {
    _cacheParsedStorage = prefixStorage(useStorage(), 'cache:content:parsed')
  }
  return _cacheParsedStorage
}

const isProduction = process.env.NODE_ENV === 'production'
const isPrerendering = import.meta.prerender

const contentConfig = () => useRuntimeConfig().content

/**
 * Invalid key characters
 */
const invalidKeyCharacters = "'\"?#/".split('')

/**
 * Filter predicate for ignore patterns
 */
const contentIgnorePredicate = (key: string) => {
  const isIgnored = makeIgnored(contentConfig().ignores)
  if (key.startsWith('preview:') || isIgnored(key)) {
    return false
  }
  if (invalidKeyCharacters.some(ik => key.includes(ik))) {

    console.warn(`Ignoring [${key}]. File name should not contain any of the following characters: ${invalidKeyCharacters.join(', ')}`)
    return false
  }

  return true
}

export const getContentsIds = async (event: H3Event, prefix?: string) => {
  let keys: string[] = []

  if (isProduction) {
    keys = await cacheParsedStorage().getKeys(prefix)
  }
  const source = sourceStorage()

  // Later: handle preview mode, etc
  if (keys.length === 0) {
    keys = await source.getKeys(prefix)
  }

  if (isPreview(event)) {
    const { key } = getPreview(event)
    const previewPrefix = `preview:${key}:${prefix || ''}`
    const previewKeys = await source.getKeys(previewPrefix)

    if (previewKeys.length) {
      const keysSet = new Set(keys)
      await Promise.all(
        previewKeys.map(async (key) => {
          const meta = await source.getMeta(key)
          if (meta?.__deleted) {
            keysSet.delete(key.substring(previewPrefix.length))
          } else {
            keysSet.add(key.substring(previewPrefix.length))
          }
        })
      )
      keys = Array.from(keysSet)
    }
  }

  return keys.filter(contentIgnorePredicate)
}

export function* chunksFromArray<T> (arr: T[], n: number) : Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n)
  }
}

let cachedContents: ParsedContent[] = []
export const cleanCachedContents = () => {
  cachedContents = [];
}

export const getContentsList = (() => {
  let pendingContentsListPromise: Promise<ParsedContent[]> | null = null

  const _getContentsList = async (event: H3Event, prefix?: string) => {
    const keys = await getContentsIds(event, prefix)

    const keyChunks = [...chunksFromArray(keys, 10)]

    const contents: ParsedContent[] = []
    for (const chunk of keyChunks) {
      const result = await Promise.all(chunk.map(key => getContent(event, key)))
      contents.push(...result)
    }
    return contents.filter(c => c && c._path)
  }

  return (event: H3Event, prefix?: string) => {
    if (event.context.__contentList) {
      return event.context.__contentList
    }
    if ((isPrerendering || !isProduction) && cachedContents.length) {
      return cachedContents
    }

    if (!pendingContentsListPromise) {
      pendingContentsListPromise = _getContentsList(event, prefix)
      pendingContentsListPromise.then((result) => {
        if (isPrerendering || !isProduction) {
          cachedContents = result as ParsedContent[]
        }
        event.context.__contentList = result as ParsedContent[]
        pendingContentsListPromise = null
      })
    }
    return pendingContentsListPromise
  }
})()

const pendingPromises: Record<string, Promise<ParsedContent>> = {}
export const getContent = async (event: H3Event, id: string): Promise<ParsedContent> => {
  const contentId = id
  // Handle ignored id
  if (!contentIgnorePredicate(id)) {
    return { _id: contentId, body: null }
  }
  const source = sourceStorage()
  const cache = cacheParsedStorage()

  if (isPreview(event)) {
    const { key } = getPreview(event)
    const previewId = `preview:${key}:${id}`
    const draft = await source.getItem(previewId)
    if (draft) {
      id = previewId
    }
  }

  const cached: any = await cache.getItem(id)
  if (isProduction && cached) {
    return cached.parsed
  }

  const config = contentConfig()
  const meta = await source.getMeta(id)
  const mtime = meta.mtime
  const size = meta.size || 0
  const hash = ohash({
    // Last modified time
    mtime,
    // File size
    size,
    // Add Content version to the hash, to revalidate the cache on content update
    version: config.cacheVersion,
    integrity: config.cacheIntegrity
  })
  if (cached?.hash === hash) {
    return cached.parsed as ParsedContent
  }

  if (!pendingPromises[id + hash]) {
    // eslint-disable-next-line no-async-promise-executor
    pendingPromises[id + hash] = new Promise(async (resolve) => {
      const body = await source.getItem(id)

      if (body === null) {
        return resolve({ _id: contentId, body: null } as unknown as ParsedContent)
      }

      const parsed = await parseContent(contentId, body) as ParsedContent

      await cache.setItem(id, { parsed, hash }).catch(() => {})

      resolve(parsed)

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete pendingPromises[id + hash]
    })
  }

  return pendingPromises[id + hash]!
}

/**
 * Parse content file using registered plugins
 */
export const parseContent = async (id: string, content: StorageValue, opts: ParseContentOptions = {}) => {
  const nitroApp = useNitroApp()
  const config = contentConfig()
  const options = defu(
    opts,
    {
      markdown: {
        ...config.markdown,
        highlight: config.highlight
      },
      csv: config.csv,
      yaml: config.yaml,
      transformers: customTransformers,
      pathMeta: {
        defaultLocale: config.defaultLocale,
        locales: config.locales,
        respectPathCase: config.respectPathCase
      }
    }
  )

  // Call hook before parsing the file
  const file = { _id: id, body: typeof content === 'string' ? content.replace(/\r\n|\r/g, '\n') : content }
  await nitroApp.hooks.callHook('content:file:beforeParse', file)

  const result = await transformContent(id, file.body, options)

  // Call hook after parsing the file
  await nitroApp.hooks.callHook('content:file:afterParse', result)

  return result
}

export const createServerQueryFetch = <T = ParsedContent>(event: H3Event) => (query: ContentQueryBuilder<T>) => {
  return createPipelineFetcher<T>(() => getIndexedContentsList<T>(event, query))(query)
}

/**
 * Query contents
 */
export function serverQueryContent<T = ParsedContent>(event: H3Event, params?: ContentQueryBuilderParams): ContentQueryBuilder<T>;
export function serverQueryContent<T = ParsedContent>(event: H3Event, query?: string, ...pathParts: string[]): ContentQueryBuilder<T>;
export function serverQueryContent<T = ParsedContent> (event: H3Event, query?: string | ContentQueryBuilderParams, ...pathParts: string[]) {
  const { advanceQuery } = useRuntimeConfig().public.content.experimental
  const config = contentConfig()
  const queryBuilder = advanceQuery
    ? createQuery<T>(createServerQueryFetch(event), { initialParams: typeof query !== 'string' ? query || {} : {}, legacy: false })
    : createQuery<T>(createServerQueryFetch(event), { initialParams: typeof query !== 'string' ? query || {} : {}, legacy: true })
  let path: string

  if (typeof query === 'string') {
    path = withLeadingSlash(joinURL(query, ...pathParts))
  }

  const originalParamsFn = queryBuilder.params
  queryBuilder.params = () => {
    const params: QueryBuilderParams = originalParamsFn()

    // Add `path` as `where` condition
    if (path) {
      params.where = params.where || []
      if (params.first && (params.where || []).length === 0) {
      // If query contains `path` and does not contain any `where` condition
      // Then can use `path` as `where` condition to find exact match
        params.where.push({ _path: withoutTrailingSlash(path) })
      } else {
        params.where.push({ _path: new RegExp(`^${path.replace(/[-[\]{}()*+.,^$\s/]/g, '\\$&')}`) })
      }
    }

    // Provide default sort order
    if (!params.sort?.length) {
      params.sort = [{ _stem: 1, $numeric: true }]
    }

    if (!import.meta.dev) {
      params.where = params.where || []
      if (!params.where.find(item => typeof item._draft !== 'undefined')) {
        params.where.push({ _draft: { $ne: true } })
      }
    }

    // Filter by locale if:
    // - locales are defined
    // - query doesn't already have a locale filter
    if (config.locales.length) {
      const queryLocale = params.where?.find(w => w._locale)?._locale
      if (!queryLocale) {
        params.where = params.where || []
        params.where.push({ _locale: config.defaultLocale })
      }
    }

    return params
  }

  return queryBuilder
}
