import type { QueryBuilderParams, QueryMatchOperator, QueryPipe, QueryPlugin } from '../../types'
import { apply, omit, pick, sortByKey } from './utils'
import { createMatch } from '.'

export function createPipelineFetcher<T> (getContentsList: () => Promise<Array<T>>, plugins: Array<QueryPlugin>) {
  // Create Matcher
  const match = createMatch({
    operators: plugins
      .filter(p => p.operators)
      .reduce((acc, p) => ({ ...acc, ...p.operators }), {} as Record<string, QueryMatchOperator>)
  })

  /**
   * Exctract surrounded items of specific condition
   */
  const surround = (data: any[], { query, before, after }: QueryBuilderParams['surround']) => {
    const matchQuery = typeof query === 'string' ? { slug: query } : query
    // Find matched item index
    const index = data.findIndex(item => match(item, matchQuery))

    before = before || 0
    after = after || 0
    const slice = new Array(before + after).fill(null, 0)

    return index === -1 ? slice : slice.map((_, i) => data[index - before + i + Number(i >= before)] || null)
  }

  const pipelines: Array<QueryPipe> = [
    // Filter items based on `params.slug`
    (data, params) => (params.slug ? data.filter(item => String(item.slug).startsWith(params.slug)) : data),
    // Conditions
    (data, params) => data.filter(item => match(item, params.where)),
    // Sort data
    (data, params) => params.sortBy.forEach(([key, direction]) => sortByKey(data, key, direction)),
    // Custom pipelines registered by plugins
    ...plugins.map((plugin: QueryPlugin) => plugin.execute!).filter(Boolean),
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
    (data, params) => (!params.deep && data[0]?.slug === params.slug ? data[0] : data)
  ]

  return async (params: QueryBuilderParams) => {
    const data = await getContentsList()

    // Provide default sort order if not specified
    if (!params.sortBy || !params.sortBy.length) {
      params.sortBy = [
        ['slug', 'asc'],
        ['position', 'asc']
      ]
    }

    return pipelines.reduce(($data: Array<T>, pipe: any) => pipe($data, params) || $data, data)
  }
}
