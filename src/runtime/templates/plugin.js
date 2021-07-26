import { withoutTrailingSlash, joinURL } from 'ufo'
import { $fetch } from 'ohmyfetch';
import Query from '~docus-core/database/providers/<%= options.provider %>/Query';
/* <% if (options.watch) { %> */ import { useWebSocket } from '~docus-core/composables/websocket' /* <% } %> */

const createQuery = (options) => (path, opts) => {
  const to = typeof path === 'string' ? path : ''
  const params = (typeof path === 'object' ? path : opts) || {}
  return new Query(to, { ...params, ...options })
}

/**
 * This helper function is used to create api in @docus/app
 **/
export function getContent(ctx) {
  const { docusDbHash } = ctx.$config ? ctx.$config : ctx.nuxtState
  const getFetchUrl = (key) => {
    /* <% if (options.isSSG) { %> */return joinURL('/_nuxt', '<%= options.apiBase %>', docusDbHash, key.replace(/^\//, '').replace(/\//g, ':') + '.json')
    /* <% } else { %> */return joinURL('/', '<%= options.apiBase %>', 'get', key)/* <% } %> */
  }

  const get = (key) => $fetch(getFetchUrl(key))

  const search = createQuery({
    /* <% if (options.isSSG) { %> */db: getFetchUrl('data:docus:naviagation'),
    /* <% } else { %> */base: withoutTrailingSlash(joinURL('/', '<%= options.apiBase %>', 'search')), /* <% } %> */
  })
  
  return {
    search: process.server ? ctx.ssrContext.docus.content.search : search,
    get: process.server ? ctx.ssrContext.docus.content.get : get,
  }
}

/**
 * This is the main entry point for the plugin.
 **/
export default async function (ctx, inject) {
  inject('content', getContent(ctx))
  /* <% if (options.watch) { %> */
  if (process.client) { useWebSocket('<%= options.apiBase %>').connect() }/* <% } %> */
}
