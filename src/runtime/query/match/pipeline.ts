import type { QueryBuilderParams, QueryBuilderSchema, QueryPipe } from '../../types'
import { apply, ensureArray, sortList, withoutKeys, withKeys } from './utils'
import { createMatch } from '.'

export function createPipelineFetcher<T> (getContentsList: () => Promise<T[]>) {
  // Create Matcher
  const match = createMatch()

  /**
   * Exctract surrounded items of specific condition
   */
  const surround = (data: any[], { query, before, after }: QueryBuilderSchema['surround']) => {
    const matchQuery = typeof query === 'string' ? { _path: query } : query
    // Find matched item index
    const index = data.findIndex(item => match(item, matchQuery))

    before = before || 1
    after = after || 1
    const slice = new Array(before + after).fill(null, 0)

    return index === -1 ? slice : slice.map((_, i) => data[index - before + i + Number(i >= before)] || null)
  }

  const pipelines: Array<QueryPipe> = [
    // Conditions
    (data, params) => data.filter(item => ensureArray(params.where).every(matchQuery => match(item, matchQuery))),
    // Sort data
    (data, params) => ensureArray(params.sort).forEach(options => sortList(data, options)),
    // Surround logic
    (data, params) => params.surround ? surround(data, params.surround) : data,
    // Skip first items
    (data, params) => (params.skip ? data.slice(params.skip) : data),
    // Pick first items
    (data, params) => (params.limit ? data.slice(0, params.limit) : data),
    // Remove unwanted fields
    (data, params) => apply(withoutKeys(params.without))(data),
    // Select only wanted fields
    (data, params) => apply(withKeys(params.only))(data),
    // Evaluate result
    (data, params) => params.first ? data[0] : data
  ]

  return async (params: QueryBuilderParams): Promise<T | T[]> => {
    const data = await getContentsList()

    return pipelines.reduce(($data: Array<T>, pipe: any) => pipe($data, params) || $data, data)
  }
}
