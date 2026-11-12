import { queryCollection } from '@nuxt/content/server'

/**
 * Simulates a request that is cancelled while it runs the lazy import:
 * the query starts, but the response is sent without waiting for it,
 * so workerd tears down the I/O of this request while the import is in flight.
 */
export default defineEventHandler((event) => {
  queryCollection(event, 'docs').count().catch(() => {})
  return 'started'
})
