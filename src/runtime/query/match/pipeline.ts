import { joinURL } from 'ufo'
import type { ContentQueryFindResponse, ContentQueryResponse } from '../../types/api'
import type { ContentQueryBuilder, ContentQueryBuilderParams } from '../../types/query'
import { apply, ensureArray, sortList, withoutKeys, withKeys, omit } from './utils'
import { createMatch } from '.'

export function createPipelineFetcher<T> (getContentsList: () => Promise<T[]>) {
  // Create Matcher
  const match = createMatch()

  /**
   * Exctract surrounded items of specific condition
   */
  const surround = (data: any[], { query, before, after }: Exclude<ContentQueryBuilderParams['surround'], undefined>) => {
    const matchQuery = typeof query === 'string' ? { _path: query } : query
    // Find matched item index
    const index = data.findIndex(item => match(item, matchQuery))

    before = before ?? 1
    after = after ?? 1
    const slice = new Array(before + after).fill(null, 0)

    return index === -1 ? slice : slice.map((_, i) => data[index - before! + i + Number(i >= before!)] || null)
  }

  type ContentQueryPipe<T, InputState = ContentQueryFindResponse<T>, OutputState = ContentQueryFindResponse<T>> = (state: InputState, params: ContentQueryBuilderParams, db: Array<T>) => OutputState | void

  const matchingPipelines: Array<ContentQueryPipe<T>> = [
    // Conditions
    (state, params) => {
      const filtered = state.result.filter(item => ensureArray(params.where!).every(matchQuery => match(item, matchQuery)))
      return {
        ...state,
        result: filtered,
        total: filtered.length
      }
    },
    // Sort data
    (state, params) => ensureArray(params.sort).forEach(options => sortList(state.result, options!)),
    function fetchSurround (state, params, db) {
      if (params.surround) {
        let _surround = surround(state.result?.length === 1 ? db : state.result, params.surround)

        _surround = apply(withoutKeys(params.without))(_surround)
        _surround = apply(withKeys(params.only))(_surround)

        // @ts-ignore
        state.surround = _surround
      }
      return state
    }
  ]

  const transformingPiples: Array<ContentQueryPipe<T>> = [
    // Skip first items
    (state, params) => {
      if (params.skip) {
        return {
          ...state,
          result: state.result.slice(params.skip),
          skip: params.skip
        }
      }
    },
    // Pick first items
    (state, params) => {
      if (params.limit) {
        return {
          ...state,
          result: state.result.slice(0, params.limit),
          limit: params.limit
        }
      }
    },
    function fetchDirConfig (state, params, db) {
      if (params.dirConfig) {
        const path = (state.result[0] as any)?._path || params.where?.find(w => w._path)?._path as string
        const dirConfig = db.find((item: any) => item._path === joinURL(path, '_dir'))
        if (dirConfig) {
          // @ts-ignore
          state.dirConfig = { _path: dirConfig._path, ...withoutKeys(['_'])(dirConfig) }
        }
      }
      return state
    },
    // Remove unwanted fields
    (state, params) => ({
      ...state,
      result: apply(withoutKeys(params.without))(state.result)
    }),
    // Select only wanted fields
    (state, params) => ({
      ...state,
      result: apply(withKeys(params.only))(state.result)
    })
  ]

  return async (query: ContentQueryBuilder<T>): Promise<ContentQueryResponse<T>> => {
    const db = await getContentsList()

    const params = query.params()

    const result1: ContentQueryFindResponse<T> = {
      result: db,
      limit: 0,
      skip: 0,
      total: db.length
    }

    const matchedData = matchingPipelines.reduce(($data, pipe) => pipe($data, params, db) || $data, result1)

    // return count if query is for count
    if (params.count) {
      return {
        result: matchedData.result.length
      }
    }

    const result = transformingPiples.reduce(($data, pipe) => pipe($data, params, db) || $data, matchedData)

    // return first item if query is for single item
    if (params.first) {
      return {
        ...omit(['skip', 'limit', 'total'])(result),
        result: result.result[0]
      }
    }

    return result
  }
}
