import type { NavItem, QueryBuilder } from '../types'
import { contentApiWithParams } from './utils'
import { useHead } from '#app'

export const fetchContentNavigation = (queryBuilder?: QueryBuilder) => {
  const path = contentApiWithParams('/navigation', queryBuilder?.params())

  if (process.server) {
    useHead({
      link: [
        { rel: 'prefetch', href: path }
      ]
    })
  }
  return $fetch<Array<NavItem>>(path)
}
