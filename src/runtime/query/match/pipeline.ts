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

  const pipelines: Array<QueryPipe> = [
    // Filter items based on `params.slug`
    (data, params) => (params.slug ? data.filter(item => String(item.slug).startsWith(params.slug)) : data),
    // Conditions
    (data, params) => data.filter(item => match(item, params.where)),
    // Sort data
    (data, params) => params.sortBy.forEach(([key, direction]) => sortByKey(data, key, direction)),
    // Custom pipelines registered by plugins
    ...plugins.map((plugin: QueryPlugin) => plugin.execute!).filter(Boolean),
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
    return pipelines.reduce(($data: Array<T>, pipe: any) => pipe($data, params) || $data, data)
  }
}
