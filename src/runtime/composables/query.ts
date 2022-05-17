import { joinURL, withLeadingSlash } from 'ufo'
import { hash } from 'ohash'
import { useHead, useCookie } from '#app'
import { createQuery } from '../query/query'
import type { ParsedContent, QueryBuilder, QueryBuilderParams } from '../types'
import { jsonStringify } from '../utils/json'
import { withContentBase } from './utils'

/**
 * Fetch query result
 */
const queryFetch = <T = ParsedContent>(params: Partial<QueryBuilderParams>) => {
  const apiPath = withContentBase(process.dev ? '/query' : `/query/${hash(params)}`)

  if (!process.dev && process.server) {
    useHead({
      link: [
        { rel: 'prefetch', href: apiPath }
      ]
    })
  }
  return $fetch<T | T[]>(apiPath, {
    method: 'GET',
    responseType: 'json',
    params: {
      _params: jsonStringify(params),
      previewToken: useCookie('previewToken').value
    }
  })
}

/**
 * Query contents
 */
export function queryContent<T = ParsedContent>(): QueryBuilder<T>;
export function queryContent<T = ParsedContent>(path?: string, ...pathParts: string[]): QueryBuilder<T>;
export function queryContent<T = ParsedContent> (path?: string, ...pathParts: string[]) {
  path = withLeadingSlash(joinURL(path, ...pathParts))

  return createQuery<T>(queryFetch)
    .where({ path: new RegExp(`^${path}`) })
}
