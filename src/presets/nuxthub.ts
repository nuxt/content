import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'pathe'
import { logger } from '../utils/dev'
import { definePreset } from '../utils/preset'
import cfPreset from './cloudflare'

export default definePreset({
  name: 'nuxthub',
  async setup(options, nuxt) {
    if (!((nuxt.options as unknown as { hub: { database?: unknown } }).hub?.database)) {
      logger.warn('NuxtHub dedected but `hub.database` is not enabled. Using local SQLite as default database instead.')
      return
    }

    // Read from the final hub database configuration
    const hubDb = nuxt.options.runtimeConfig.hub.database
    // NuxtHub < 1
    if (nuxt.options.hub?.database === true) {
      options.database ||= { type: 'd1', bindingName: 'DB' }
    }
    else if (typeof nuxt.options.hub?.database === 'string' && typeof hubDb === 'object') {
      if (hubDb.driver === 'D1') {
        options.database ||= { type: 'd1', bindingName: 'DB' }
      }
      else if (hubDb.driver === 'node-postgres') {
        options.database ||= { type: 'postgresql', url: hubDb.connection.url }
      }
      else {
        options.database ||= { type: hubDb.driver, ...hubDb.connection }
      }
    }
  },
  async setupNitro(nitroConfig, options) {
    const { nuxt } = options
    const hubConfig = nuxt.options.runtimeConfig.hub
    // NuxtHub < v1
    if (nuxt.options.hub?.database === true) {
      if (nitroConfig.runtimeConfig?.content?.database?.type === 'sqlite') {
        logger.warn('Deploying with NuxtHub < 1 requires using D1 database, switching to D1 database with binding `DB`.')
        nitroConfig.runtimeConfig!.content!.database = { type: 'd1', bindingName: 'DB' }
      }
      await cfPreset.setupNitro(nitroConfig, options)
    }
    else if (typeof nuxt.options.hub?.database === 'string') {
      const hubDb = hubConfig.database
      if (hubDb.driver === 'D1') {
        nitroConfig.runtimeConfig!.content!.database ||= { type: 'd1', bindingName: 'DB' }
        await cfPreset.setupNitro(nitroConfig, options)
      }
      else if (hubDb.driver === 'node-postgres') {
        nitroConfig.runtimeConfig!.content!.database ||= { type: 'postgresql', url: hubDb.connection.url }
      }
      else {
        nitroConfig.runtimeConfig!.content!.database ||= { type: hubDb.driver, ...hubDb.connection }
      }
    }

    if (!nuxt.options.dev) {
      // Write SQL dump to database queries when not in dev mode
      await mkdir(resolve(nitroConfig.rootDir!, hubConfig.dir, 'database/queries'), { recursive: true })
      let i = 1
      // Drop info table and prepare for new dump
      let dump = 'DROP TABLE IF EXISTS _content_info;'
      const dumpFiles: Array<{ file: string, content: string }> = []
      Object.values(options.manifest.dump).forEach((value) => {
        value.forEach((line) => {
          if ((dump.length + line.length) < 1000000) {
            dump += '\n' + line
          }
          else {
            dumpFiles.push({ file: `content-database-${String(i).padStart(3, '0')}.sql`, content: dump.trim() })
            dump = line
            i += 1
          }
        })
      })
      if (dump.length > 0) {
        dumpFiles.push({ file: `content-database-${String(i).padStart(3, '0')}.sql`, content: dump.trim() })
      }
      for (const dumpFile of dumpFiles) {
        await writeFile(resolve(nitroConfig.rootDir!, hubConfig.dir, 'database/queries', dumpFile.file), dumpFile.content)
      }
      // Disable integrity check in production for performance
      nitroConfig.runtimeConfig!.content ||= {}
      nitroConfig.runtimeConfig!.content.integrityCheck = false
    }
  },
})
