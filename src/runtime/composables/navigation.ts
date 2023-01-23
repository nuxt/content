import { hash } from 'ohash'
import { useRuntimeConfig, useCookie } from '#app'
import type { NavItem, QueryBuilder, QueryBuilderParams } from '../types'
import { encodeQueryParams } from '../utils/query'
import { jsonStringify } from '../utils/json'
import { addPrerenderPath, shouldUseClientDB, withContentBase } from './utils'
import { queryContent } from './query'

export const fetchContentNavigation = async (queryBuilder?: QueryBuilder | QueryBuilderParams): Promise<Array<NavItem>> => {
  const { content } = useRuntimeConfig().public

  // Ensure that queryBuilder is an instance of QueryBuilder
  if (typeof queryBuilder?.params !== 'function') {
    queryBuilder = queryContent(queryBuilder as QueryBuilderParams)
  }

  // Get query params from queryBuilder instance to ensure default values are applied
  const params: QueryBuilderParams = queryBuilder.params()

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

  const data = await $fetch<NavItem[]>(apiPath as any, {
    method: 'GET',
    responseType: 'json',
    params: content.experimental.stripQueryParameters
      ? undefined
      : {
          _params: jsonStringify(params),
          previewToken: useCookie('previewToken').value
        }
  })

  // On SSG, all url are redirected to `404.html` when not found, so we need to check the content type
  // to know if the response is a valid JSON or not
  if (typeof data === 'string' && (data as string).startsWith('<!DOCTYPE html>')) {
    throw new Error('Not found')
  }

  return data
}
