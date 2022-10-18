import { hash } from 'ohash'
import { useCookie } from '#app'
import type { NavItem, QueryBuilder, QueryBuilderParams } from '../types'
import { jsonStringify } from '../utils/json'
import { addPrerenderPath, shouldUseClientDB, withContentBase } from './utils'

export const fetchContentNavigation = async (queryBuilder?: QueryBuilder | QueryBuilderParams): Promise<Array<NavItem>> => {
  let params = queryBuilder

  // When params is an instance of QueryBuilder then we need to pick the params explicitly
  if (typeof params?.params === 'function') { params = params.params() }

  const apiPath = withContentBase(params ? `/navigation/${hash(params)}.json` : '/navigation')

  // Add `prefetch` to `<head>` in production
  if (!process.dev && process.server) {
    addPrerenderPath(apiPath)
  }

  if (shouldUseClientDB()) {
    const generateNavigation = await import('./client-db').then(m => m.generateNavigation)
    return generateNavigation(params || {})
  }

  const data = await $fetch(apiPath, {
    method: 'GET',
    responseType: 'json',
    params: {
      _params: jsonStringify(params || {}),
      previewToken: useCookie('previewToken').value
    }
  })

  // On SSG, all url are redirected to `404.html` when not found, so we need to check the content type
  // to know if the response is a valid JSON or not
  if (typeof data === 'string' && data.startsWith('<!DOCTYPE html>')) {
    throw new Error('Not found')
  }

  return data
}
