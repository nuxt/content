import { defineNitroPlugin } from 'nitropack/runtime'
import useContentDatabase from '../adaptors'
import { useRuntimeConfig } from '#imports'

export default defineNitroPlugin(async (nitro) => {
  const config = useRuntimeConfig().contentv3

  const _handler = nitro.h3App.handler
  let checkDatabaseIntegrity = true
  let promise: Promise<void> | undefined
  nitro.h3App.handler = async function (event) {
    // TODO fix multiple times event handler
    if (checkDatabaseIntegrity) {
      checkDatabaseIntegrity = false
      promise = checkAndImportDatabaseIntegrity(config.integrityVersion)
        .then((isValid) => { checkDatabaseIntegrity = !isValid })
        .catch((error) => {
          console.log('Database integrity check failed, rebuilding database', error)
          checkDatabaseIntegrity = true
        })
    }

    promise && await promise

    return _handler(event)
  }
})

async function checkAndImportDatabaseIntegrity(integrityVersion: string) {
  const db = useContentDatabase()
  const before = await db.first<{ version: string }>('select * from _info').catch(() => ({ version: '' }))
  if (before?.version === integrityVersion) {
    return true
  }

  // @ts-expect-error - Vite doesn't know about the import
  await (await import('#content-v3/dump' /* @vite-ignore */).then(m => m.default()))
    .reduce((prev: Promise<void>, sql: string) => prev.then(() => {
      return db.exec(sql).catch((error) => {
        console.log('Failed to execute sql', sql, error)
        throw error
      })
    }), Promise.resolve())

  const after = await db.first<{ version: string }>('select * from _info').catch(() => ({ version: '' }))

  return after?.version === integrityVersion
}
