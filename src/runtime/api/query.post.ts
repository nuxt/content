import { createError, defineEventHandler, getRequestHeader, getRouterParam, readBody, useRuntimeConfig } from 'nuxt/server'
import { withoutBase } from 'ufo'
import loadDatabaseAdapter, { checkAndImportDatabaseIntegrity } from '../internal/database.server'
import { assertSafeQuery, MAX_QUERY_BODY_BYTES } from '../internal/security'
import type { RuntimeConfig } from '@nuxt/content'

export default defineEventHandler(async (event) => {
  const contentLength = Number(getRequestHeader(event, 'content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_QUERY_BODY_BYTES) {
    throw createError({
      status: 413,
      statusText: 'Request body too large',
    })
  }

  const { sql } = await readBody<{ sql: string }>(event)
  const config = useRuntimeConfig()
  const collection = getRouterParam(event, 'collection') || withoutBase(event.url.pathname, config.app.baseURL).split('/')[2] || ''

  assertSafeQuery(sql, collection)

  const conf = config.content as RuntimeConfig['content']
  if (conf.integrityCheck) {
    await checkAndImportDatabaseIntegrity(event, collection, conf)
  }

  return (await loadDatabaseAdapter(conf)).all(sql)
})
