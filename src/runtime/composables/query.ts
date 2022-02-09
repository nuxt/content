import { createQuery } from '../query/query'
import type { QueryBuilderParams, ParsedContentMeta } from '../types'
import { withContentBase } from './content'

/**
 * Fetch query result
 */
const queryFetch = (body: Partial<QueryBuilderParams>) =>
  $fetch<any>(withContentBase('/query'), { method: 'POST', body })

/**
 * Query contents
 */
export const useContentQuery = <T = ParsedContentMeta>(
  body?: string | Partial<QueryBuilderParams>,
  aq?: Partial<QueryBuilderParams>
) => {
  if (typeof body === 'string') {
    body = {
      slug: body,
      ...aq
    }
  }

  return createQuery<T>(queryFetch, body)
}
