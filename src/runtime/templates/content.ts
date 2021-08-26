import { withoutTrailingSlash, joinURL } from 'ufo'
// @ts-ignore
import Query from '~docus/database/Query'

const createQuery = (options: any) => (path: string, opts: any) => {
  const to = typeof path === 'string' ? path : ''
  const params = (typeof path === 'object' ? path : opts) || {}
  return new Query(to, { ...params, ...options })
}

/**
 * This helper function is used to create api in @docus/app
 **/
export function getContent(ctx: any) {
  let { $docus } = ctx.$config ? ctx.$config : ctx.nuxtState
  // TODO: replace with public runtime config
  if (!$docus) {
    $docus = {
      apiBase: '_docus',
      wsUrl: 'ws://localhost:4000'
    }
  }

  const fetch = (key: string, opts: any = undefined) => globalThis.$fetch(joinURL('/api', $docus.apiBase, key), opts)

  const get = (key: string) => fetch(joinURL('get', key))

  const search = createQuery({
    base: withoutTrailingSlash(joinURL('/api', $docus.apiBase, 'search')),
  })

  return {
    fetch,
    get,
    search
  }
}

/**
 * This is the main entry point for the plugin.
 **/
export default async function (ctx: any, inject: any) {
  inject('content', getContent(ctx))
}
