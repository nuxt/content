import { joinURL, withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { hash } from 'ohash'
import { createQuery } from '../../query/query'
import type { ParsedContent, QueryBuilder, QueryBuilderParams } from '@nuxt/content'
import { encodeQueryParams } from '../../utils/query'
import { jsonStringify } from '../../utils/json'
import { addPrerenderPath, shouldUseClientDB, withContentBase } from '../../composables/utils'
import { useContentPreview } from '../../composables/preview'
import { useRuntimeConfig } from '#imports'

/**
 * Query fetcher
 */
export const createQueryFetch = <T = ParsedContent>() => async (query: QueryBuilder<T>) => {
  const { content } = useRuntimeConfig().public

  const params = query.params()

  const apiPath = content.experimental.stripQueryParameters
    ? withContentBase(`/query/${import.meta.dev ? '_' : `${hash(params)}.${content.integrity}`}/${encodeQueryParams(params as any)}.json`)
    : withContentBase(import.meta.dev ? '/query' : `/query/${hash(params)}.${content.integrity}.json`)

  // Prefetch the query
  if (!import.meta.dev && import.meta.server) {
    addPrerenderPath(apiPath)
  }

  if (shouldUseClientDB()) {
    const db = await import('./client-db').then(m => m.useContentDatabase())
    return db.fetch(query as QueryBuilder<ParsedContent>)
  }

  const _query = content.experimental.stripQueryParameters
  ? undefined
  : `_params=${encodeURIComponent(jsonStringify(params))}&previewToken=${useContentPreview().getPreviewToken()}`
  const data = await $fetch(apiPath + '?' + _query, { method: 'GET', responseType: 'json' })

  // On SSG, all url are redirected to `404.html` when not found, so we need to check the content type
  // to know if the response is a valid JSON or not
  if (typeof data === 'string' && data.startsWith('<!DOCTYPE html>')) {
    throw new Error('Not found')
  }

  return data
}

/**
 * Query contents from path
 */
export function queryContent<T = ParsedContent> (query?: QueryBuilderParams): QueryBuilder<T>;
export function queryContent<T = ParsedContent>(query: string, ...pathParts: string[]): QueryBuilder<T>;
export function queryContent<T = ParsedContent> (query?: string | QueryBuilderParams, ...pathParts: string[]) {
  const { content } = useRuntimeConfig().public
  const queryBuilder = createQuery<T>(createQueryFetch() as any, {
    initialParams: typeof query !== 'string' ? query as any : {},
    legacy: true
  })
  let path: string

  if (typeof query === 'string') {
    path = withLeadingSlash(joinURL(query, ...pathParts))
  }

  const originalParamsFn = queryBuilder.params
  queryBuilder.params = () => {
    const params = originalParamsFn()

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

    // Filter by locale if:
    // - locales are defined
    // - query doesn't already have a locale filter
    if (content.locales.length) {
      const queryLocale = params.where?.find(w => w._locale)?._locale
      if (!queryLocale) {
        params.where = params.where || []
        params.where.push({ _locale: content.defaultLocale })
      }
    }

    return params
  }

  return queryBuilder as unknown as QueryBuilder<T>
}
