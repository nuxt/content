import { joinURL, withLeadingSlash } from 'ufo'
import { useHead } from '#app'
import { createQuery } from '../query/query'
import type { ParsedContent, QueryBuilder, QueryBuilderParams } from '../types'
import { contentApiWithParams } from './utils'

/**
 * Fetch query result
 */
const queryFetch = (params: Partial<QueryBuilderParams>) => {
  const path = contentApiWithParams('/query', params)

  if (process.server) {
    useHead({
      link: [
        { rel: 'prefetch', href: path }
      ]
    })
  }
  return $fetch<Array<ParsedContent>>(path)
}

/**
 * Query contents
 */
export function queryContent(): QueryBuilder;
export function queryContent(slug?: string, ...slugParts: string[]): QueryBuilder;
export function queryContent (slug?: string, ...slugParts: string[]) {
  const body: Partial<QueryBuilderParams> = {
    slug: withLeadingSlash(joinURL(slug, ...slugParts))
  }

  return createQuery(queryFetch, body)
}
