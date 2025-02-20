import { eventHandler, getRouterParam, readBody } from 'h3'
import type { RuntimeConfig } from '@nuxt/content'
import loadDatabaseAdapter, { checkAndImportDatabaseIntegrity } from '../internal/database.server'
import { assertSafeQuery } from '../internal/security'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  const { sql } = await readBody(event)
  const collection = getRouterParam(event, 'collection')!

  assertSafeQuery(sql, collection)

  const conf = useRuntimeConfig().content as RuntimeConfig['content']
  if (conf.integrityCheck) {
    await checkAndImportDatabaseIntegrity(event, collection, conf)
  }

  return loadDatabaseAdapter(conf).all(sql)
})
