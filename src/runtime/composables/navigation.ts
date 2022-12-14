import { hash } from 'ohash'
import { useCookie, useRuntimeConfig } from '#app'
import type { NavItem, QueryBuilder, QueryBuilderParams } from '../types'
import { jsonStringify } from '../utils/json'
import { addPrerenderPath, shouldUseClientDB, withContentBase } from './utils'

export const fetchContentNavigation = async (queryBuilder?: QueryBuilder | QueryBuilderParams): Promise<Array<NavItem>> => {
  const { content } = useRuntimeConfig().public

  // When params is an instance of QueryBuilder then we need to pick the params explicitly
  const params: QueryBuilderParams = typeof queryBuilder?.params === 'function' ? queryBuilder.params() : queryBuilder

  // Filter by locale if:
  // - locales are defined
  // - query doesn't already have a locale filter
  if (content.locales.length) {
    const queryLocale = params.where?.find(w => w._locale)?._locale
    if (!queryLocale) {
      params.where = params.where || []
      params.where.push({ _locale: content.defaultLocale })
    }
  }

  const _apiPath = params ? `/navigation/${hash(params)}` : '/navigation/'
  const apiPath = withContentBase(process.dev ? _apiPath : `${_apiPath}.${content.integrity}.json`)

  // Add `prefetch` to `<head>` in production
  if (!process.dev && process.server) {
    addPrerenderPath(apiPath)
  }

  if (shouldUseClientDB()) {
    const generateNavigation = await import('./client-db').then(m => m.generateNavigation)
    return generateNavigation(params)
  }

  const data = await $fetch<NavItem[]>(apiPath, {
    method: 'GET',
    responseType: 'json',
    params: {
      _params: jsonStringify(params || {}),
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
