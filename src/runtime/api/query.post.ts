import { eventHandler, getRouterParam, readBody, getHeader, createError } from 'h3'
import loadDatabaseAdapter, { checkAndImportDatabaseIntegrity } from '../internal/database.server'
import { assertSafeQuery, MAX_SQL_QUERY_LENGTH } from '../internal/security'
import type { RuntimeConfig } from '@nuxt/content'
import { useRuntimeConfig } from '#imports'

/**
 * Body envelope is `{"sql":"…"}`. Cap on UTF-16 code units in `sql` is
 * MAX_SQL_QUERY_LENGTH; JSON can expand each unit up to ~6 bytes (`\uXXXX`)
 * plus a small fixed wrapper. Use the worst case so legitimate max-length SQL
 * is never rejected by the body limit before assertSafeQuery sees it.
 *
 * Content-Length can be absent or forged — assertSafeQuery still bounds `sql`.
 * This is a fast-path reject only when a trustworthy length is present.
 */
const JSON_WRAPPER_OVERHEAD = 16 // `{"sql":""}` plus a little slack
const MAX_BODY_BYTES = MAX_SQL_QUERY_LENGTH * 6 + JSON_WRAPPER_OVERHEAD

export default eventHandler(async (event) => {
  const contentLength = Number(getHeader(event, 'content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
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
