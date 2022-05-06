import type { QueryBuilderParams, QueryPipe } from '../../types'
import { apply, ensureArray, omit, pick, sortByKey } from './utils'
import { createMatch } from '.'

export function createPipelineFetcher<T> (getContentsList: () => Promise<T[]>) {
  // Create Matcher
  const match = createMatch()

  /**
   * Exctract surrounded items of specific condition
   */
  const surround = (data: any[], { query, before, after }: QueryBuilderParams['surround']) => {
    const matchQuery = typeof query === 'string' ? { slug: query } : query
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
    (data, params) => ensureArray(params.sortBy).forEach(([key, direction]) => sortByKey(data, key, direction)),
    // Surround logic
    (data, params) => params.surround ? surround(data, params.surround) : data,
    // Skip first items
    (data, params) => (params.skip ? data.slice(params.skip) : data),
    // Pick first items
    (data, params) => (params.limit ? data.slice(0, params.limit) : data),
    // Remove unwanted fields
    (data, params) => apply(omit(params.without))(data),
    // Select only wanted fields
    (data, params) => apply(pick(params.only))(data),
    // Evaluate result
    (data, params) => params.first ? data[0] : data
  ]

  return async (params: QueryBuilderParams): Promise<T | T[]> => {
    const data = await getContentsList()

    // Provide default sort order if not specified
    if (!params.sortBy || !params.sortBy.length) {
      params.sortBy = [
        ['path', 'asc']
      ]
    }

    return pipelines.reduce(($data: Array<T>, pipe: any) => pipe($data, params) || $data, data)
  }
}
