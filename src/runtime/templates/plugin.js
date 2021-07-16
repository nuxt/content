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
  const query = createQuery({
    /* <%
    if (options.isSSG) { 
      %> */  db: `<%= options.dbPath %>/db-${docusDbHash}.json`,/* <%
    } else { 
     %> */ base: withoutTrailingSlash(joinURL('/', '<%= options.apiBase %>', 'search')), /* <%
    } %> */
    })
    
  const data = (key) => $fetch(joinURL('/', '<%= options.apiBase %>', 'get', key))
  return {
    search: process.server ? ctx.ssrContext.docus.content.search : query,
    get: process.server ? ctx.ssrContext.docus.content.get : data,
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
