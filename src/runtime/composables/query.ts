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
  $fetch<any>(withContentBase('/query'), { method: 'POST', headers: { Accept: 'application/json' }, body })

/**
 * Query contents
 */
export function queryContent(): QueryBuilder;
export function queryContent(slug?: string, ...slugParts: string[]): QueryBuilder;
export function queryContent (slug?: string, ...slugParts: string[]) {
  const body: Partial<QueryBuilderParams> = {
    slug: withLeadingSlash(joinURL(slug, ...slugParts))
  }

  return createQuery(queryFetch, body, plugins)
}
