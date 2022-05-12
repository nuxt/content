import { prefixStorage } from 'unstorage'
import { joinURL, withLeadingSlash } from 'ufo'
import { hash as ohash } from 'ohash'
import type { CompatibilityEvent } from 'h3'
import type { QueryBuilderParams, ParsedContent, QueryBuilder } from '../types'
import { createQuery } from '../query/query'
import { createPipelineFetcher } from '../query/match/pipeline'
import { parse, transform } from './transformers'
// eslint-disable-next-line import/named
import { getPreview, isPreview } from './preview'
import { useRuntimeConfig, useStorage } from '#imports'

export const sourceStorage = prefixStorage(useStorage(), 'content:source')
export const cacheStorage = prefixStorage(useStorage(), 'cache:content')

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Content ignore patterns
 */
export const contentIgnores = useRuntimeConfig().content.ignores.map((p: any) =>
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
    keys = await cacheStorage.getKeys(`parsed:${prefix}`)
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
    return { id: contentId, body: null }
  }

  if (isPreview(event)) {
    const { key } = getPreview(event)
    const previewId = `preview:${key}:${id}`
    const draft = await sourceStorage.getItem(previewId)
    if (draft) {
      id = previewId
    }
  }

  const cached: any = await cacheStorage.getItem(`parsed:${id}`)
  if (isProduction && cached) {
    return cached.parsed
  }

  const meta = await sourceStorage.getMeta(id)
  const hash = ohash(meta)
  if (cached?.hash === hash) {
    return cached.parsed as ParsedContent
  }

  const body = await sourceStorage.getItem(id)

  if (body === null) {
    return { id: contentId, body: null }
  }

  const parsedContent = await parse(contentId, body as string).then(transform)
  const parsed = {
    ...meta,
    ...parsedContent
  }

  await cacheStorage.setItem(`parsed:${id}`, { parsed, hash }).catch(() => {})

  return parsed
}

/**
 * Query contents
 */
export function serverQueryContent<T = ParsedContent>(event: CompatibilityEvent): QueryBuilder<T>;
export function serverQueryContent<T = ParsedContent>(event: CompatibilityEvent, params?: Partial<QueryBuilderParams>): QueryBuilder<T>;
export function serverQueryContent<T = ParsedContent>(event: CompatibilityEvent, slug?: string, ...slugParts: string[]): QueryBuilder<T>;
export function serverQueryContent<T = ParsedContent> (event: CompatibilityEvent, slug?: string | Partial<QueryBuilderParams>, ...slugParts: string[]) {
  let params = (slug || {}) as Partial<QueryBuilderParams>
  if (typeof slug === 'string') {
    slug = withLeadingSlash(joinURL(slug, ...slugParts))
    params = {
      where: [{ slug: new RegExp(`^${slug}`) }]
    }
  }
  const pipelineFetcher = createPipelineFetcher<T>(
    () => getContentsList(event) as unknown as Promise<T[]>
  )

  // Provide default sort order
  if (!params.sortBy?.length) {
    params.sortBy = [['path', 'asc']]
  }

  return createQuery<T>(pipelineFetcher, params)
}
