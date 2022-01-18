import { match } from './match'
import { apply, ensureArray, omit, pick, sortByKey } from './utils'
// @ts-ignore
import { plugins } from '#docus-query-plugins'

export const createQuery = <T>(
  db: Array<T> | DatabaseFetcher<T>,
  queryParams?: Partial<QueryBuilderParams>
): QueryBuilder<T> => {
  const params: QueryBuilderParams = {
    to: '',
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
    fetch() {
      if (typeof db === 'function') {
        return db(params)
      }
      const data = db || []
      const pipelines: Array<QueryPipe> = [
        // Filter items based on `params.to`
        data => (params.to ? data.filter(item => item.to === params.to || item.to.startsWith(params.to)) : data),
        // Conditions
        data => data.filter(item => match(item, params.where)),
        // Sort data
        data => params.sortBy.forEach(([key, direction]) => sortByKey(data, key, direction)),
        // Custom pipelines registered by plugins
        ...plugins.map((plugin: QueryPlugin) => plugin.execute).filter(Boolean),
        // Skip first items
        data => (params.skip ? data.slice(params.skip) : data),
        // Pick first items
        data => (params.limit ? data.slice(0, params.limit) : data),
        // Remove unwanted fields
        apply(omit(params.without)),
        // Select only wanted fields
        apply(pick(params.only)),
        // Evaluate result
        data => (!params.deep && data[0]?.to === params.to ? data[0] : data)
      ]

      return pipelines.reduce(($data: any, pipe: any) => pipe($data, params) || $data, data)
    },
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
  plugins.forEach((plugin: QueryPlugin) => {
    Object.keys(plugin.queries || {}).forEach(key => {
      // @ts-ignore
      query[key] = (...args: any[]) => plugin.queries[key](params, query)(...args) || query
    })
  })

  return query
}
