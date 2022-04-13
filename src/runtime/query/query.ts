import type { DatabaseFetcher, ParsedContentMeta, QueryBuilder, QueryBuilderParams } from '../types'
import { ensureArray } from './match/utils'

export const createQuery = (
  fetcher: DatabaseFetcher<ParsedContentMeta>,
  queryParams?: Partial<QueryBuilderParams>
): QueryBuilder => {
  const params = {
    sortBy: [],
    ...queryParams,
    where: queryParams?.where ? ensureArray(queryParams.where) : [],
    only: queryParams?.only ? ensureArray(queryParams.only) : [],
    without: queryParams?.without ? ensureArray(queryParams.without) : []
  } as QueryBuilderParams

  /**
   * Factory function to create a parameter setter
   */
  const $set = (key: string, fn: (...values: any[]) => any = v => v) => {
    return (...values: []) => {
      params[key] = fn(...values)
      return query
    }
  }

  const query: QueryBuilder = {
    params: () => Object.freeze(params),
    only: $set('only', ensureArray),
    without: $set('without', ensureArray),
    where: $set('where', (q: any) => [...(params.where), q]),
    sortBy: $set('sortBy', (field, direction) => [...params.sortBy, [field, direction]]),
    limit: $set('limit', v => parseInt(String(v), 10)),
    skip: $set('skip', v => parseInt(String(v), 10)),
    // find
    findOne: () => fetcher({ ...params, first: true }) as Promise<ParsedContentMeta>,
    find: () => fetcher(params) as Promise<Array<ParsedContentMeta>>,
    findSurround: (query, options) => fetcher({ ...params, surround: { query, ...options } }) as Promise<Array<ParsedContentMeta>>,
    // locale
    locale: (locale: string) => query.where({ locale })
  }

  return query
}
