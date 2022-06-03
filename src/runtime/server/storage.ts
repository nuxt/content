import { prefixStorage } from 'unstorage'
import { joinURL, withLeadingSlash } from 'ufo'
import { hash as ohash } from 'ohash'
import type { CompatibilityEvent } from 'h3'
import type { QueryBuilderParams, ParsedContent, QueryBuilder } from '../types'
import { createQuery } from '../query/query'
import { createPipelineFetcher } from '../query/match/pipeline'
import { parseContent } from './transformers'
import { getPreview, isPreview } from './preview'
// eslint-disable-next-line import/named
import { useRuntimeConfig, useStorage } from '#imports'

export const sourceStorage = prefixStorage(useStorage(), 'content:source')
export const cacheStorage = prefixStorage(useStorage(), 'cache:content')
export const cacheParsedStorage = prefixStorage(useStorage(), 'cache:content:parsed')

const isProduction = process.env.NODE_ENV === 'production'

const contentConfig = useRuntimeConfig().content
/**
 * Content ignore patterns
 */
export const contentIgnores = contentConfig.ignores.map((p: any) =>
  typeof p === 'string' ? new RegExp(`^${p}`) : p
)

/**
 * Filter predicate for ignore patterns
 */
const contentIgnorePredicate = (key: string) =>
  !key.startsWith('preview:') && !contentIgnores.some((prefix: RegExp) => key.split(':').some(k => prefix.test(k)))

export const getContentsIds = async (event: CompatibilityEvent, prefix?: string) => {
  let keys = []

  if (isProduction) {
    keys = await cacheParsedStorage.getKeys(prefix)
  }

  // Later: handle preview mode, etc
  if (keys.length === 0) {
    keys = await sourceStorage.getKeys(prefix)
  }

  if (isPreview(event)) {
    const { key } = getPreview(event)
    const previewPrefix = `preview:${key}:${prefix || ''}`
    const previewKeys = await sourceStorage.getKeys(previewPrefix)

    if (previewKeys.length) {
      const keysSet = new Set(keys)
      await Promise.all(
        previewKeys.map(async (key) => {
          const meta = await sourceStorage.getMeta(key)
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

export const getContentsList = async (event: CompatibilityEvent, prefix?: string) => {
  const keys = await getContentsIds(event, prefix)
  const contents = await Promise.all(keys.map(key => getContent(event, key)))

  return contents
}

export const getContent = async (event: CompatibilityEvent, id: string): Promise<ParsedContent> => {
  const contentId = id
  // Handle ignored id
  if (!contentIgnorePredicate(id)) {
    return { _id: contentId, body: null }
  }

  if (isPreview(event)) {
    const { key } = getPreview(event)
    const previewId = `preview:${key}:${id}`
    const draft = await sourceStorage.getItem(previewId)
    if (draft) {
      id = previewId
    }
  }

  const cached: any = await cacheParsedStorage.getItem(id)
  if (isProduction && cached) {
    return cached.parsed
  }

  const meta = await sourceStorage.getMeta(id)
  const hash = ohash({
    meta,
    // Add Content version to the hash, to revalidate the cache on content update
    version: contentConfig.cacheVersion,
    integerity: contentConfig.cacheIntegrity
  })
  if (cached?.hash === hash) {
    return cached.parsed as ParsedContent
  }

  const body = await sourceStorage.getItem(id)

  if (body === null) {
    return { _id: contentId, body: null }
  }

  const parsed = await parseContent(contentId, body as string)

  await cacheParsedStorage.setItem(id, { parsed, hash }).catch(() => {})

  return parsed
}

/**
 * Query contents
 */
export function serverQueryContent<T = ParsedContent>(event: CompatibilityEvent): QueryBuilder<T>;
export function serverQueryContent<T = ParsedContent>(event: CompatibilityEvent, params?: QueryBuilderParams): QueryBuilder<T>;
export function serverQueryContent<T = ParsedContent>(event: CompatibilityEvent, path?: string, ...pathParts: string[]): QueryBuilder<T>;
export function serverQueryContent<T = ParsedContent> (event: CompatibilityEvent, path?: string | QueryBuilderParams, ...pathParts: string[]) {
  let params = (path || {}) as QueryBuilderParams
  if (typeof path === 'string') {
    path = withLeadingSlash(joinURL(path, ...pathParts))
    // escape regex special chars
    path = path.replace(/[-[\]{}()*+.,^$\s]/g, '\\$&')

    params = {
      where: [{ _path: new RegExp(`^${path}`) }]
    }
  }
  const pipelineFetcher = createPipelineFetcher<T>(
    () => getContentsList(event) as unknown as Promise<T[]>
  )

  // Provide default sort order
  if (!params.sort?.length) {
    params.sort = [{ _file: 1, $numeric: true }]
  }

  return createQuery<T>(pipelineFetcher, params)
}
