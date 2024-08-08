import { defineNitroPlugin } from 'nitropack/runtime'
import useContentDatabase from '../adaptors'
import { useRuntimeConfig } from '#imports'

export default defineNitroPlugin(async (nitro) => {
  const config = useRuntimeConfig().contentv3

  // Ignore updating production database if the config is set to isolatedProductionDatabase
  if (config.isolatedProductionDatabase === true) {
    return
  }

  const _handler = nitro.h3App.handler
  let checkDatabaseIntegrity = true
  let promise: Promise<void> | undefined
  nitro.h3App.handler = async function (event) {
    if (checkDatabaseIntegrity) {
      checkDatabaseIntegrity = false
      promise = checkAndImportDatabaseIntegrity(config.integrityVersion)
        .then((isValid) => { checkDatabaseIntegrity = !isValid })
        .catch(() => { checkDatabaseIntegrity = true })
    }

    promise && await promise

    return _handler(event)
  }
})

async function checkAndImportDatabaseIntegrity(integrityVersion: string) {
  const before = await useContentDatabase().first<{ version: string }>('select * from _info').catch(() => ({ version: '' }))
  if (before?.version === integrityVersion) {
    return true
  }

  await import('../initializer')
    .then(m => m.default)
    .then(initializeDatabase => initializeDatabase())

  const after = await useContentDatabase().first<{ version: string }>('select * from _info').catch(() => ({ version: '' }))

  return after?.version === integrityVersion
}
