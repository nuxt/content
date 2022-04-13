import type { NavItem, QueryBuilder } from '../types'
import { contentApiWithParams } from './utils'

export const fetchContentNavigation = (queryBuilder?: QueryBuilder) => {
  return $fetch<Array<NavItem>>(contentApiWithParams('/navigation', queryBuilder?.params()))
}
