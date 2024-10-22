import { eventHandler, readValidatedBody, getRouterParam, type H3Event } from 'h3'
import { z } from 'zod'
import useContentDatabase from '../../adapters'
import { decompressSQLDump } from '../../../internal/dump'
import { loadDatabaseDump } from '../../../internal/app.server'
import { getTableName } from '../../../internal/app'
import { integrityVersion } from '#content/manifest'

let checkDatabaseIntegrity = true
export default eventHandler(async (event) => {
  const collectionName = getRouterParam(event, 'collection')
  const { query: sqlQuery } = await readValidatedBody(event, z.object({ query: z.string() }).parse)

  if (!sqlQuery || !sqlQuery.toUpperCase().startsWith('SELECT')) {
    throw new Error('Invalid query')
  }

  const tablename = sqlQuery.match(/FROM\s+(\w+)/)?.[1]
  if (tablename !== getTableName(String(collectionName))) {
    throw new Error('Invalid query')
  }

  if (checkDatabaseIntegrity) {
    checkDatabaseIntegrity = false
    await checkAndImportDatabaseIntegrity(event, integrityVersion)
      .then((isValid) => { checkDatabaseIntegrity = !isValid })
      .catch((error) => {
        console.log('Database integrity check failed, rebuilding database', error)
        checkDatabaseIntegrity = true
      })
  }

  return useContentDatabase().all(sqlQuery)
})

async function checkAndImportDatabaseIntegrity(event: H3Event, integrityVersion: string) {
  const db = useContentDatabase()
  const before = await db.first<{ version: string }>(`select * from ${getTableName('_info')}`).catch(() => ({ version: '' }))
  if (before?.version) {
    if (before?.version === integrityVersion) {
      return true
    }
    // Delete old version
    await db.exec(`DELETE FROM ${getTableName('_info')} WHERE version = '${before.version}'`)
  }

  const dump = await loadDatabaseDump(event).then(decompressSQLDump)

  // await db.exec(dump.join('\n'))
  await dump.reduce(async (prev: Promise<void>, sql: string) => {
    await prev
    await db.exec(sql).catch((error) => {
      console.log('error', error)
      // throw error
    })
  }, Promise.resolve())

  const after = await db.first<{ version: string }>(`select * from ${getTableName('_info')}`).catch(() => ({ version: '' }))
  return after?.version === integrityVersion
}
