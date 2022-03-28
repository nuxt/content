import type { NavItem } from '../types'
import { defineQueryPlugin } from '.'

export interface Queries {
  /**
   * Find navigation object for current query
   */
  findNavigation?(): Promise<NavItem[]>
}

export default defineQueryPlugin({
  name: 'navigation',
  queries: params => ({
    findNavigation: () => $fetch(`/api/${useRuntimeConfig().content.basePath}/navigation`, {
      method: 'POST',
      body: params
    })
  })
})
