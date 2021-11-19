import { withoutTrailingSlash, joinURL } from 'ufo'
import Query from '#docus/database/Query'

const createQuery = (options: any) => (path: string, opts: any) => {
  const to = typeof path === 'string' ? path : ''
  const params = (typeof path === 'object' ? path : opts) || {}
  return new Query(to, { ...params, ...options })
}

/**
 * This helper function is used to create api in @docus/app
 **/
export function getContent(ctx: any, previewKey: string = '') {
  let { $docus } = ctx.$config ? ctx.$config : ctx.nuxtState
  // TODO: replace with public runtime config
  if (!$docus) {
    $docus = {
      apiBase: '_docus',
      wsUrl: 'ws://localhost:4000'
    }
  }

  // Preview mode query params
  const query = previewKey ? '?preview=' + previewKey : ''

  const fetch = (key: string, opts: any = undefined) => globalThis.$fetch(joinURL('/api', $docus.apiBase, key) + query, opts)

  const get = (key: string) => fetch(joinURL('get', key))

  const search = createQuery({
    base: withoutTrailingSlash(joinURL('/api', $docus.apiBase, 'search') + query),
  })

  if (previewKey) {
    return {
      fetch,
      get,
      search,
      setItem: async (key: string, content: string) => {
        await fetch('preview', { method: 'POST', body: { key, content } })
        if (typeof window !== 'undefined') {
          // @ts-ignore
          window.$nuxt.$emit('docus:content:preview', { key, event: 'change' })
        }
        
      },
      removeItem: async (key: string) => {
        await fetch(joinURL("preview", key), { method: "DELETE" })
        if (typeof window !== 'undefined') {
          // @ts-ignore
          window.$nuxt.$emit('docus:content:preview', { key, event: 'remove' })
        }
      }
    }
  }

  return {
    fetch,
    get,
    search,
    preview: (previewKey = 'memory') => getContent(ctx, previewKey)
  }
}

/**
 * This is the main entry point for the plugin.
 **/
export default async function (ctx: any, inject: any) {
  inject('content', getContent(ctx))
}
