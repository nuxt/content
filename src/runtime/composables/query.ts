import { joinURL, withLeadingSlash } from 'ufo'
import { createQuery } from '../query/query'
import type { QueryBuilder, QueryBuilderParams } from '../types'
import { withContentBase } from './content'
// @ts-ignore
import { plugins } from '#query-plugins'

/**
 * Fetch query result
 */
const queryFetch = (body: Partial<QueryBuilderParams>) =>
  $fetch<any>(withContentBase('/query'), { method: 'POST', body })

/**
 * Query contents
 */
export function useContentQuery(): QueryBuilder;
export function useContentQuery(slug: string): QueryBuilder;
export function useContentQuery(params: Partial<QueryBuilderParams>): QueryBuilder;
export function useContentQuery(slug: string, params: Partial<QueryBuilderParams>): QueryBuilder;
export function useContentQuery(...slugParts: string[]): QueryBuilder;
export function useContentQuery (
  slug?: string | Partial<QueryBuilderParams>,
  params?: string | Partial<QueryBuilderParams>,
  ...slugParts: string[]
) {
  let body: Partial<QueryBuilderParams> = {}
  if (typeof slug === 'object') {
    body = slug
  } else if (typeof params === 'object') {
    body = { slug, ...params }
  } else if (slug) {
    slugParts = [params, ...slugParts].filter(Boolean)
    body = {
      slug: withLeadingSlash(joinURL(slug, ...slugParts))
    }
  }

  return createQuery(queryFetch, body, plugins)
}
