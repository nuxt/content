import type { DatabaseFetcher, QueryBuilder, QueryBuilderParams, SortOptions } from '../types'
import { ParsedContent } from '../types'
import { ensureArray } from './match/utils'

const arrayParams = ['sort', 'where', 'only', 'without']

export const createQuery = <T = ParsedContent>(
  fetcher: DatabaseFetcher<T>,
  queryParams?: QueryBuilderParams
): QueryBuilder<T> => {
  const params = {
    ...queryParams
  } as QueryBuilderParams

  for (const key of arrayParams) {
    if (params[key]) {
      params[key] = ensureArray(params[key])
    }
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
    params: () => Object.freeze(params),
    only: $set('only', ensureArray) as () => ReturnType<QueryBuilder<T>['only']>,
    without: $set('without', ensureArray),
    where: $set('where', (q: any) => [...ensureArray(params.where), q]),
    sort: $set('sort', (sort: SortOptions) => [...ensureArray(params.sort), ...ensureArray(sort)]),
    limit: $set('limit', v => parseInt(String(v), 10)),
    skip: $set('skip', v => parseInt(String(v), 10)),
    // find
    findOne: () => fetcher({ ...params, first: true }) as Promise<T>,
    find: () => fetcher(params) as Promise<Array<T>>,
    findSurround: (query, options) => fetcher({ ...params, surround: { query, ...options } }) as Promise<Array<T>>,
    // locale
    locale: (_locale: string) => query.where({ _locale })
  }

  return query
}
