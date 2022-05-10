import type { DatabaseFetcher, QueryBuilder, QueryBuilderParams } from '../types'
import { ensureArray } from './match/utils'

const arrayParams = ['sortBy', 'where', 'only', 'without']

export const createQuery = <T>(
  fetcher: DatabaseFetcher<T>,
  queryParams?: Partial<QueryBuilderParams>
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
    only: $set('only', ensureArray),
    without: $set('without', ensureArray),
    where: $set('where', (q: any) => [...ensureArray(params.where), q]),
    sortBy: $set('sortBy', (field, direction) => [...ensureArray(params.sortBy), [field, direction]]),
    limit: $set('limit', v => parseInt(String(v), 10)),
    skip: $set('skip', v => parseInt(String(v), 10)),
    // find
    findOne: () => fetcher({ ...params, first: true }) as Promise<T>,
    find: () => fetcher(params) as Promise<Array<T>>,
    findSurround: (query, options) => fetcher({ ...params, surround: { query, ...options } }) as Promise<Array<T>>,
    // locale
    locale: (locale: string) => query.where({ locale })
  }

  return query
}
