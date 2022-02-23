import { createQuery } from '../query/query'
import type { QueryBuilderParams } from '../types'
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
export const useContentQuery = (
  body?: string | Partial<QueryBuilderParams>,
  aq?: Partial<QueryBuilderParams>
) => {
  if (typeof body === 'string') {
    body = {
      slug: body,
      ...aq
    }
  }

  return createQuery(queryFetch, body, plugins)
}
