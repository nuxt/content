import { joinURL, withLeadingSlash } from 'ufo'
import { prefixStorage } from 'unstorage'
import { hash as ohash } from 'ohash'
import type { CompatibilityEvent } from 'h3'
import type { QueryBuilderParams, ParsedContent, QueryBuilder } from '../types'
import { createQuery } from '../query/query'
import { createPipelineFetcher } from '../query/match/pipeline'
import { parse, transform } from './transformers'
// eslint-disable-next-line import/named
import { useRuntimeConfig, useStorage } from '#imports'

export const sourceStorage = prefixStorage(useStorage(), 'content:source')
export const cacheStorage = prefixStorage(useStorage(), 'cache:content')
export const cacheParsedStorage = prefixStorage(useStorage(), 'cache:content:parsed')

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
  !contentIgnores.some((prefix: RegExp) => key.split(':').some(k => prefix.test(k)))

export const getContentsIds = async (prefix?: string) => {
  let keys = []

  if (isProduction) {
    keys = await cacheParsedStorage.getKeys(prefix)
  }

  // Later: handle preview mode, etc
  if (keys.length === 0) {
    keys = await sourceStorage.getKeys(prefix)
  }

  return keys.filter(contentIgnorePredicate)
}

export const getContentsList = async (prefix?: string) => {
  const keys = await getContentsIds(prefix)
  const contents = await Promise.all(keys.map(key => getContent(key)))

  return contents
}

export const getContent = async (id: string): Promise<ParsedContent> => {
  // Handle ignored id
  if (!contentIgnorePredicate(id)) {
    return { id, body: null }
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
    return { id, body: null }
  }

  const parsedContent = await parse(id, body as string).then(transform)
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
export function serverQueryContent<T = ParsedContent>(event: CompatibilityEvent, path?: string, ...pathParts: string[]): QueryBuilder<T>;
export function serverQueryContent<T = ParsedContent> (_event: CompatibilityEvent, path?: string | Partial<QueryBuilderParams>, ...pathParts: string[]) {
  let params = (path || {}) as Partial<QueryBuilderParams>
  if (typeof path === 'string') {
    path = withLeadingSlash(joinURL(path, ...pathParts))
    params = {
      where: [{ path: new RegExp(`^${path}`) }]
    }
  }
  const pipelineFetcher = createPipelineFetcher<T>(
    getContentsList as unknown as () => Promise<T[]>
  )

  // Provide default sort order
  if (!params.sortBy?.length) {
    params.sortBy = [['file', 'asc']]
  }

  return createQuery<T>(pipelineFetcher, params)
}
