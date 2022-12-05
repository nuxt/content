import { joinURL, withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { hash } from 'ohash'
import { useCookie, useRuntimeConfig } from '#app'
import { createQuery } from '../query/query'
import type { ParsedContent, QueryBuilder, QueryBuilderParams } from '../types'
import { jsonStringify } from '../utils/json'
import { addPrerenderPath, shouldUseClientDB, withContentBase } from './utils'

/**
 * Query fetcher
 */
export const createQueryFetch = <T = ParsedContent>(path?: string) => async (query: QueryBuilder<T>) => {
  const { content } = useRuntimeConfig().public
  if (path) {
    if (query.params().first && (query.params().where || []).length === 0) {
      // If query contains `path` and does not contain any `where` condition
      // Then can use `path` as `where` condition to find exact match
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

  const apiPath = withContentBase(process.dev ? '/query' : `/query/${hash(params)}.${content.integrity}.json`)

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
    params: {
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
  if (typeof query === 'string') {
    return createQuery<T>(createQueryFetch(withLeadingSlash(joinURL(query, ...pathParts))))
  }

  return createQuery<T>(createQueryFetch(), query)
}
