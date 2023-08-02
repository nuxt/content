import type { QueryBuilder } from '../../types'
import { ContentQueryBuilder } from '../../types/query'
import { createPipelineFetcher } from './pipeline'

export function createPipelineFetcherLegacy<T> (getContentsList: () => Promise<T[]>) {
  const _pipelineFetcher = createPipelineFetcher(getContentsList)

  return async (query: QueryBuilder<T>): Promise<T | T[]> => {
    const params = query.params()
    const result = await _pipelineFetcher(query as unknown as ContentQueryBuilder<T>)

    if (params.surround) {
      // @ts-ignore
      return result.surround
    }

    return result.result as any
  }
}
