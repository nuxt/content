import type { QueryBuilder, QueryBuilderParams, QueryPipe } from '../../types'
import { apply, ensureArray, sortList, withoutKeys, withKeys } from './utils'
import { createMatch } from '.'

export function createPipelineFetcher<T> (getContentsList: () => Promise<T[]>) {
  // Create Matcher
  const match = createMatch()

  /**
   * Exctract surrounded items of specific condition
   */
  const surround = (data: any[], { query, before, after }: Exclude<QueryBuilderParams['surround'], undefined>) => {
    const matchQuery = typeof query === 'string' ? { _path: query } : query
    // Find matched item index
    const index = data.findIndex(item => match(item, matchQuery))

    before = before ?? 1
    after = after ?? 1
    const slice = new Array(before + after).fill(null, 0)

    return index === -1 ? slice : slice.map((_, i) => data[index - before! + i + Number(i >= before!)] || null)
  }

  const pipelines: Array<QueryPipe> = [
    // Conditions
    (data, params) => data.filter(item => ensureArray(params.where!).every(matchQuery => match(item, matchQuery))),
    // Sort data
    (data, params) => ensureArray(params.sort).forEach(options => sortList(data, options!)),
    // Surround logic
    (data, params) => params.surround ? surround(data, params.surround) : data,
    // Skip first items
    (data, params) => (params.skip ? data.slice(params.skip) : data),
    // Pick first items
    (data, params) => (params.limit ? data.slice(0, params.limit) : data),
    // Remove unwanted fields
    (data, params) => apply(withoutKeys(params.without))(data),
    // Select only wanted fields
    (data, params) => apply(withKeys(params.only))(data)
  ]

  return async (query: QueryBuilder<T>): Promise<T | T[]> => {
    const data = await getContentsList()
    const params = query.params()

    const filteredData = pipelines.reduce(($data: Array<T>, pipe: QueryPipe) => pipe($data, params) || $data, data)

    // return first item if query is for single item
    if (params.first) {
      return filteredData[0]
    }

    return filteredData
  }
}
