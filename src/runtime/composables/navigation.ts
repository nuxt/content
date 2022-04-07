import type { NavItem, QueryBuilder } from '../types'
import { withContentBase } from './utils'

export const fetchContentNavigation = (queryBuilder?: QueryBuilder) => {
  return $fetch<Array<NavItem>>(withContentBase('/navigation'), {
    method: 'POST',
    body: queryBuilder?.params()
  })
}
