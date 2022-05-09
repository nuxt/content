import { hash } from 'ohash'
import { useHead } from '#app'
import type { NavItem, QueryBuilder } from '../types'
import { jsonStringify } from '../utils/json'
import { withContentBase } from './utils'

export const fetchContentNavigation = (queryBuilder?: QueryBuilder) => {
  const params = queryBuilder?.params()
  const path = withContentBase(`/navigation/${hash(params)}`)

  if (process.server) {
    useHead({
      link: [
        { rel: 'prefetch', href: path }
      ]
    })
  }
  return $fetch<Array<NavItem>>(path, {
    method: 'GET',
    responseType: 'json',
    params: {
      params: jsonStringify(params)
    }
  })
}
