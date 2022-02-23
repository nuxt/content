import type { DatabaseFetcher, ParsedContentMeta, QueryBuilder, QueryBuilderParams, QueryPlugin } from '../types'
import { ensureArray } from './match/utils'

export const createQuery = <T = ParsedContentMeta>(
  fetcher: DatabaseFetcher<T>,
  queryParams?: Partial<QueryBuilderParams>,
  plugins?: Array<QueryPlugin>
): QueryBuilder<T> => {
  const params: QueryBuilderParams = {
    slug: '',
    first: false,
    skip: 0,
    limit: 0,
    only: [],
    without: [],
    sortBy: [],
    where: {},
    surround: undefined,
    ...queryParams
  }

  /**
   * Factory function to create a parameter setter
   */
  const $set = (key: string, fn: (...values: any[]) => any = v => v) => {
    return (...values: []) => {
      params[key] = fn(...values)
      return query
    }
  }

  const query: QueryBuilder<T> = {
    only: $set('only', ensureArray),
    without: $set('without', ensureArray),
    where: $set('where'),
    sortBy: $set('sortBy', (field, direction) => [...params.sortBy, [field, direction]]),
    limit: $set('limit', v => parseInt(String(v), 10)),
    skip: $set('skip', v => parseInt(String(v), 10)),
    // find
    findOne: () => fetcher({ ...params, first: true }) as Promise<T>,
    find: () => fetcher(params) as Promise<Array<T>>,
    findSurround: (query, options) => fetcher({ ...params, surround: { query, ...options } }) as Promise<Array<T>>
  }

  // Register plugins
  ;(plugins || []).filter(p => p.queries).forEach((p) => {
    const queries = p.queries(params, query) || {}
    Object.entries(queries).forEach(([key, fn]) => {
      query[key] = (...args) => fn(...args) || query
    })
  })

  return query
}
