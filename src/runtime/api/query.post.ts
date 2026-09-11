import { eventHandler, getRouterParam, readBody, getHeader, createError } from 'h3'
import loadDatabaseAdapter, { checkAndImportDatabaseIntegrity } from '../internal/database.server'
import { assertSafeQuery, MAX_SQL_QUERY_LENGTH } from '../internal/security'
import type { RuntimeConfig } from '@nuxt/content'
import { useRuntimeConfig } from '#imports'

// Allow a small envelope overhead on top of the max SQL string itself.
const MAX_BODY_BYTES = MAX_SQL_QUERY_LENGTH + 4096

export default eventHandler(async (event) => {
  // Cheap content-length guard before buffering the body (defense-in-depth).
  // Attackers can omit/forge Content-Length; assertSafeQuery still bounds `sql`.
  const contentLength = Number(getHeader(event, 'content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Request body too large',
    })
  }

  const { sql } = await readBody(event)
  const collection = getRouterParam(event, 'collection')! || event.path?.split('/')?.[2] || ''

  assertSafeQuery(sql, collection)

  const conf = useRuntimeConfig().content as RuntimeConfig['content']
  if (conf.integrityCheck) {
    await checkAndImportDatabaseIntegrity(event, collection, conf)
  }

  return (await loadDatabaseAdapter(conf)).all(sql)
})
