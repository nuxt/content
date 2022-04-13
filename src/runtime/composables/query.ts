import { joinURL, withLeadingSlash } from 'ufo'
import { createQuery } from '../query/query'
import type { ParsedContent, QueryBuilder, QueryBuilderParams } from '../types'
import { contentApiWithParams } from './utils'

/**
 * Fetch query result
 */
const queryFetch = (params: Partial<QueryBuilderParams>) => {
  return $fetch<Array<ParsedContent>>(contentApiWithParams('/query', params))
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
