import { joinURL, withLeadingSlash } from 'ufo'
import { hash } from 'ohash'
import { useHead } from '#app'
import { createQuery } from '../query/query'
import type { ParsedContent, QueryBuilder, QueryBuilderParams } from '../types'
import { withContentBase } from './utils'

/**
 * Fetch query result
 */
const queryFetch = (params: Partial<QueryBuilderParams>) => {
  const path = withContentBase(`/query/${hash(params)}`)

  if (process.server) {
    useHead({
      link: [
        { rel: 'prefetch', href: path }
      ]
    })
  }
  return $fetch<Array<ParsedContent>>(path, {
    method: 'GET',
    responseType: 'json',
    params: {
      params: JSON.stringify(params)
    }
  })
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
