import { joinURL, withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { hash } from 'ohash'
import { useRuntimeConfig, useCookie } from '#app'
import { createQuery } from '../query/query'
import type { ParsedContent, QueryBuilder, QueryBuilderParams } from '../types'
import { encodeQueryParams } from '../utils/query'
import { jsonStringify } from '../utils/json'
import { addPrerenderPath, shouldUseClientDB, withContentBase } from './utils'

/**
 * Query fetcher
 */
export const createQueryFetch = <T = ParsedContent>() => async (query: QueryBuilder<T>) => {
  const { content } = useRuntimeConfig().public

  const params = query.params()

  const apiPath = content.experimental.stripQueryParameters
    ? withContentBase(`/query/${process.dev ? '_' : `${hash(params)}.${content.integrity}`}/${encodeQueryParams(params)}.json`)
    : withContentBase(process.dev ? '/query' : `/query/${hash(params)}.${content.integrity}.json`)

  // Prefetch the query
  if (!process.dev && process.server) {
    addPrerenderPath(apiPath)
  }

  if (shouldUseClientDB()) {
    const db = await import('./client-db').then(m => m.useContentDatabase())
    return db.fetch(query as QueryBuilder<ParsedContent>)
  }

  const data = await $fetch(apiPath as any, {
    method: 'GET',
    responseType: 'json',
    params: content.experimental.stripQueryParameters
      ? undefined
      : {
          _params: jsonStringify(params),
          previewToken: useCookie('previewToken').value
        }
  })

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
export function queryContent<T = ParsedContent>(): QueryBuilder<T>;
export function queryContent<T = ParsedContent>(query: string, ...pathParts: string[]): QueryBuilder<T>;
export function queryContent<T = ParsedContent> (query: QueryBuilderParams): QueryBuilder<T>;
export function queryContent<T = ParsedContent> (query?: string | QueryBuilderParams, ...pathParts: string[]) {
  const { content } = useRuntimeConfig().public
  const queryBuilder = createQuery<T>(createQueryFetch(), typeof query !== 'string' ? query : {})
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
      params.sort = [{ _file: 1, $numeric: true }]
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

  return queryBuilder
}
