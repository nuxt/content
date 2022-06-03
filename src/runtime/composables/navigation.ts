import { hash } from 'ohash'
import { useHead, useCookie } from '#app'
import type { NavItem, QueryBuilder, QueryBuilderParams } from '../types'
import { jsonStringify } from '../utils/json'
import { withContentBase } from './utils'

export const fetchContentNavigation = (queryBuilder?: QueryBuilder | QueryBuilderParams) => {
  let params = queryBuilder

  // When params is an instance of QueryBuilder then we need to pick the params explicitly
  if (typeof params?.params === 'function') { params = params.params() }

  const apiPath = withContentBase(params ? `/navigation/${hash(params)}` : '/navigation')

  if (!process.dev && process.server) {
    useHead({
      link: [
        { rel: 'prefetch', href: apiPath }
      ]
    })
  }
  return $fetch<Array<NavItem>>(apiPath, {
    method: 'GET',
    responseType: 'json',
    params: {
      _params: jsonStringify(params || {}),
      previewToken: useCookie('previewToken').value
    }
  })
}
