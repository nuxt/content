import { hash } from 'ohash'
import { useRuntimeConfig } from '#app'
import type { NavItem, QueryBuilder, QueryBuilderParams } from '../types'
import { encodeQueryParams } from '../utils/query'
import { jsonStringify } from '../utils/json'
import { ContentQueryBuilder } from '../types/query'
import { addPrerenderPath, shouldUseClientDB, withContentBase } from './utils'
import { queryContent } from './query'
import { useContentPreview } from './preview'

export const fetchContentNavigation = async (queryBuilder?: QueryBuilder | QueryBuilderParams | ContentQueryBuilder): Promise<Array<NavItem>> => {
  const { content } = useRuntimeConfig().public

  // Ensure that queryBuilder is an instance of QueryBuilder
  if (typeof queryBuilder?.params !== 'function') {
    queryBuilder = queryContent(queryBuilder as any)
  }

  // Get query params from queryBuilder instance to ensure default values are applied
  const params = queryBuilder.params()

  const apiPath = content.experimental.stripQueryParameters
    ? withContentBase(`/navigation/${process.dev ? '_' : `${hash(params)}.${content.integrity}`}/${encodeQueryParams(params)}.json`)
    : withContentBase(process.dev ? `/navigation/${hash(params)}` : `/navigation/${hash(params)}.${content.integrity}.json`)

  // Add `prefetch` to `<head>` in production
  if (!process.dev && process.server) {
    addPrerenderPath(apiPath)
  }

  if (shouldUseClientDB()) {
    const generateNavigation = await import('./client-db').then(m => m.generateNavigation)
    return generateNavigation(params)
  }

  const data = await $fetch(apiPath as any, {
    method: 'GET',
    responseType: 'json',
    params: content.experimental.stripQueryParameters
      ? undefined
      : {
          _params: jsonStringify(params),
          previewToken: useContentPreview().getPreviewToken()
        }
  })

  // On SSG, all url are redirected to `404.html` when not found, so we need to check the content type
  // to know if the response is a valid JSON or not
  if (typeof data === 'string' && (data as string).startsWith('<!DOCTYPE html>')) {
    throw new Error('Not found')
  }

  return data
}
