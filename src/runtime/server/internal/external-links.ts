import { defineComarkPlugin } from 'comark'
import { visit } from 'comark/utils'
import type { ElementNode } from 'comark'

const EXTERNAL_LINK_RE = /^https?:\/\//i

export interface ExternalLinksOptions {
  /**
   * `rel` added to external links that don't set one.
   * @default 'nofollow'
   */
  rel?: string
}

/**
 * Add `rel="nofollow"` to external (`http(s)://`) links, as Nuxt Content v3 did
 * through `rehype-external-links`. Links with their own `rel` are left as-is.
 */
export default defineComarkPlugin((options: ExternalLinksOptions = {}) => {
  const rel = options.rel ?? 'nofollow'
  return {
    name: 'external-links',
    post(state) {
      visit(state.tree, node => Array.isArray(node) && node[0] === 'a', (node) => {
        const props = (node as ElementNode)[1]
        if (typeof props.href === 'string' && EXTERNAL_LINK_RE.test(props.href) && props.rel === undefined) {
          props.rel = rel
        }
      })
    },
  }
})
