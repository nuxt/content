import { eventHandler, getRouterParam, readValidatedBody } from 'h3'
import { z } from 'zod'
import loadDatabaseAdapter, { checkAndImportDatabaseIntegrity } from '../internal/database.server'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  const { sql } = await readValidatedBody(event, z.object({ sql: z.string() }).parse)
  const collection = getRouterParam(event, 'collection')!

  const conf = useRuntimeConfig().content
  await checkAndImportDatabaseIntegrity(event, collection, conf)

  return loadDatabaseAdapter(conf).all(sql)
})
