import { joinURL, withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { hash } from 'ohash'
import { useCookie, useRuntimeConfig } from '#app'
import { createQuery } from '../query/query'
import type { ParsedContent, QueryBuilder, QueryBuilderParams } from '../types'
import { jsonStringify } from '../utils/json'
import { addPrerenderPath, withContentBase } from './utils'

/**
 * Query fetcher
 */
export const createQueryFetch = <T = ParsedContent>(path?: string) => async (query: QueryBuilder<T>) => {
  if (path) {
    if (query.params().first) {
      query.where({ _path: withoutTrailingSlash(path) })
    } else {
      query.where({ _path: new RegExp(`^${path.replace(/[-[\]{}()*+.,^$\s/]/g, '\\$&')}`) })
    }
  }
  // Provide default sort order
  if (!query.params().sort?.length) {
    query.sort({ _file: 1, $numeric: true })
  }

  const params = query.params()

  const apiPath = withContentBase(process.dev ? '/query' : `/query/${hash(params)}.json`)

  // Prefetch the query
  if (!process.dev && process.server) {
    addPrerenderPath(apiPath)
  }

  if (process.client && useRuntimeConfig().content.spa) {
    const db = await import('../query/spa').then(m => m.useContentDatabase())
    return db.fetch(query)
  }

  return $fetch(apiPath as any, {
    method: 'GET',
    responseType: 'json',
    params: {
      _params: jsonStringify(params),
      previewToken: useCookie('previewToken').value
    }
  })
}

/**
 * Query contents from path
 */
export function queryContent<T = ParsedContent>(): QueryBuilder<T>;
export function queryContent<T = ParsedContent>(query: string, ...pathParts: string[]): QueryBuilder<T>;
export function queryContent<T = ParsedContent> (query: QueryBuilderParams): QueryBuilder<T>;
export function queryContent<T = ParsedContent> (query?: string | QueryBuilderParams, ...pathParts: string[]) {
  if (typeof query === 'string') {
    return createQuery<T>(createQueryFetch(withLeadingSlash(joinURL(query, ...pathParts))))
  }

  return createQuery<T>(createQueryFetch(), query)
}
