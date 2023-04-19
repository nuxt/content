import type { DatabaseFetcher, QueryBuilder, QueryBuilderParams, SortOptions } from '../types'
import { ParsedContent } from '../types'
import { ensureArray } from './match/utils'

const arrayParams = ['sort', 'where', 'only', 'without']

export const createQuery = <T = ParsedContent>(
  fetcher: DatabaseFetcher<T>,
  intitialParams?: QueryBuilderParams
): QueryBuilder<T> => {
  const queryParams = {
    ...intitialParams
  } as QueryBuilderParams

  for (const key of arrayParams) {
    if (queryParams[key]) {
      queryParams[key] = ensureArray(queryParams[key])
    }
  }

  /**
   * Factory function to create a parameter setter
   */
  const $set = (key: string, fn: (...values: any[]) => any = v => v) => {
    return (...values: []) => {
      queryParams[key] = fn(...values)
      return query
    }
  }

  const query: QueryBuilder<T> = {
    params: () => ({
      ...queryParams,
      ...(queryParams.where ? { where: [...ensureArray(queryParams.where)] } : {}),
      ...(queryParams.sort ? { sort: [...ensureArray(queryParams.sort)] } : {})
    }),
    only: $set('only', ensureArray) as () => ReturnType<QueryBuilder<T>['only']>,
    without: $set('without', ensureArray),
    where: $set('where', (q: any) => [...ensureArray(queryParams.where), ...ensureArray(q)]),
    sort: $set('sort', (sort: SortOptions) => [...ensureArray(queryParams.sort), ...ensureArray(sort)]),
    limit: $set('limit', v => parseInt(String(v), 10)),
    skip: $set('skip', v => parseInt(String(v), 10)),
    // find
    find: () => fetcher(query) as Promise<Array<T>>,
    findOne: () => {
      queryParams.first = true
      return fetcher(query) as Promise<T>
    },
    findSurround: (surroundQuery, options) => {
      queryParams.surround = { query: surroundQuery, ...options }
      return fetcher(query) as Promise<Array<T>>
    },
    // locale
    locale: (_locale: string) => query.where({ _locale })
  }

  return query
}
