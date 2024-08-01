import { defineNitroPlugin } from 'nitropack/runtime'
import useDatabaseAdaptor from '../adaptors'
import { useRuntimeConfig } from '#imports'

export default defineNitroPlugin(async (nitro) => {
  const config = useRuntimeConfig().contentv3

  // Ignore updating production database if the config is set to isolatedProductionDatabase
  if (config.isolatedProductionDatabase === true) {
    return
  }

  const _handler = nitro.h3App.handler
  let checkDatabaseIntegrity = true
  nitro.h3App.handler = async function (event) {
    if (checkDatabaseIntegrity) {
      checkDatabaseIntegrity = false
      const db = useDatabaseAdaptor()
      const _info = await db.first<{ version: string }>('select * from info').catch(() => null)
      // Ignore updating production database if the integrityVersion is the same
      if (_info?.version !== config.integrityVersion) {
        await import('../initializer').then(m => m.default).then(initializeDatabase => initializeDatabase())
      }
    }
    return _handler(event)
  }
})
