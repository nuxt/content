import { eventHandler, getRouterParam, readBody, getHeader, createError } from 'h3'
import loadDatabaseAdapter, { checkAndImportDatabaseIntegrity } from '../internal/database.server'
import { assertSafeQuery, MAX_QUERY_BODY_BYTES } from '../internal/security'
import type { RuntimeConfig } from '@nuxt/content'
import { useRuntimeConfig } from 'nitropack/runtime'

export default eventHandler(async (event) => {
  const contentLength = Number(getHeader(event, 'content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_QUERY_BODY_BYTES) {
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
