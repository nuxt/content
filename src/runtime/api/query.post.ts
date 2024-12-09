import { eventHandler, getRouterParam, readValidatedBody } from 'h3'
import * as z from 'zod'
import type { RuntimeConfig } from '@nuxt/content'
import loadDatabaseAdapter, { checkAndImportDatabaseIntegrity } from '../internal/database.server'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  const { sql } = await readValidatedBody(event, z.object({ sql: z.string() }).parse)
  const collection = getRouterParam(event, 'collection')!

  const conf = useRuntimeConfig().content as RuntimeConfig['content']
  await checkAndImportDatabaseIntegrity(event, collection, conf)

  return loadDatabaseAdapter(conf).all(sql)
})
