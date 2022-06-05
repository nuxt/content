import { joinURL, withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { hash } from 'ohash'
import { useHead, useCookie } from '#app'
import { createQuery } from '../query/query'
import type { ParsedContent, QueryBuilder, QueryBuilderParams } from '../types'
import { jsonStringify } from '../utils/json'
import { withContentBase } from './utils'

/**
 * Query fetcher
 */
export const queryFetch = <T = ParsedContent>(params: QueryBuilderParams) => {
  const apiPath = withContentBase(process.dev ? '/query' : `/query/${hash(params)}`)

  // Prefetch the query
  if (!process.dev && process.server) {
    useHead({
      link: [
        { rel: 'prefetch', href: apiPath }
      ]
    })
  }

  return $fetch<T | T[]>(apiPath as any, {
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
    let path = withLeadingSlash(withoutTrailingSlash(joinURL(query, ...pathParts)))
    // escape regex special chars
    path = path.replace(/[-[\]{}()*+.,^$\s]/g, '\\$&')

    return createQuery<T>(queryFetch).where({ _path: new RegExp(`^${path}`) })
  }

  return createQuery<T>(queryFetch, query)
}
