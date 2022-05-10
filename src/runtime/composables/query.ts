import { joinURL, withLeadingSlash } from 'ufo'
import { hash } from 'ohash'
import { useHead } from '#app'
import { createQuery } from '../query/query'
import type { ParsedContent, QueryBuilder, QueryBuilderParams } from '../types'
import { jsonStringify } from '../utils/json'
import { withContentBase } from './utils'

/**
 * Fetch query result
 */
const queryFetch = <T = ParsedContent>(params: Partial<QueryBuilderParams>) => {
  const path = withContentBase(`/query/${hash(params)}`)

  if (process.server) {
    useHead({
      link: [
        { rel: 'prefetch', href: path }
      ]
    })
  }
  return $fetch<T | T[]>(path, {
    method: 'GET',
    responseType: 'json',
    params: {
      params: jsonStringify(params)
    }
  })
}

/**
 * Query contents
 */
export function queryContent<T = ParsedContent>(): QueryBuilder<T>;
export function queryContent<T = ParsedContent>(slug?: string, ...slugParts: string[]): QueryBuilder<T>;
export function queryContent<T = ParsedContent> (slug?: string, ...slugParts: string[]) {
  slug = withLeadingSlash(joinURL(slug, ...slugParts))

  return createQuery<T>(queryFetch)
    .where({ slug: new RegExp(`^${slug}`) })
}
