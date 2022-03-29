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
    findNavigation: () => {
      /**
       * TODO:
       *
       * Fix this basePath by reintroducing `useRuntimeConfig().content.basePath`
       *
       * The current usage of `useRuntimeConfig` in that context breaks when we used this code
       * as an external (node_modules), and not in the local playground.
       *
       * As a workaround, I hardcoded the default basePath as no project currently rewrites it.
       *
       * We need to find a fix for this ASAP.
       */
      const basePath = '_content'

      return $fetch(`/api/${basePath}/navigation`, {
        method: 'POST',
        body: params
      })
    }
  })
})
