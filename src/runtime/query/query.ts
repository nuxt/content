import type { DatabaseFetcher, ParsedContent, QueryBuilder, QueryBuilderParams, QueryPlugin } from '../types'
import { ensureArray } from './match/utils'

export const createQuery = <T = ParsedContent>(
  fetcher: DatabaseFetcher<T>,
  queryParams?: Partial<QueryBuilderParams>,
  plugins?: Array<QueryPlugin>
): QueryBuilder<T> => {
  const params: QueryBuilderParams = {
    slug: '',
    deep: false,
    skip: 0,
    limit: 0,
    only: [],
    without: [],
    sortBy: [],
    where: {},
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
    fetch: () => fetcher(params),
    only: $set('only', ensureArray),
    without: $set('without', ensureArray),
    where: $set('where'),
    deep: $set('deep', v => v !== false),
    sortBy: $set('sortBy', (field, direction) => [...params.sortBy, [field, direction]]),
    surround: $set('surround', (slugOrTo, options) => ({ slugOrTo, options })),
    limit: $set('limit', v => parseInt(String(v), 10)),
    skip: $set('skip', v => parseInt(String(v), 10))
  }

  // Register plugins
  for (const plugin of plugins || []) {
    Object.assign(
      query,
      Object.entries(plugin.queries || {}).reduce((acc, [key, fn]) => {
        acc[key] = (...args: any[]) => fn(params, query as any)(...args) || query
        return acc
      }, {} as any)
    )
  }

  return query
}
