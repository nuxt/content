import { prefixStorage, createStorage } from 'unstorage'
import overlay from 'unstorage/drivers/overlay'
import { joinURL, withLeadingSlash } from 'ufo'
import { hash as ohash } from 'ohash'
import type { CompatibilityEvent } from 'h3'
import type { QueryBuilderParams, ParsedContent, QueryBuilder } from '../types'
import { createQuery } from '../query/query'
import { createPipelineFetcher } from '../query/match/pipeline'
import { parse, transform } from './transformers'
// eslint-disable-next-line import/named
import { getPreview, isPreview, isPreview } from './preview'
import { useRuntimeConfig, useStorage } from '#imports'

export const sourceStorage = prefixStorage(useStorage(), 'content:source')
export const cacheStorage = prefixStorage(useStorage(), 'cache:content')
export const cacheParsedStorage = prefixStorage(useStorage(), 'cache:content:parsed')
// Todo: handle multiple storage (one per token)
// TODO: Remove preview storage in favor of mounting driver unser `content:source:preview:` prefix
export const previewStorage = createStorage({
  driver: overlay({
    layers: [
      sourceStorage
    ]
  })
})
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
      // TODO: refactor merge logic
      await Promise.all(
        previewKeys.map(async (key) => {
          const item = await sourceStorage.getItem(key)
          if (item === '__OVERLAY_REMOVED__') {
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

  const cached: any = await cacheParsedStorage.getItem(id)
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

  await cacheParsedStorage.setItem(id, { parsed, hash }).catch(() => {})

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
