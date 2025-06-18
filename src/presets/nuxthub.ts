import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'pathe'
import { logger } from '../utils/dev'
import { definePreset } from '../utils/preset'
import cfPreset from './cloudflare'

export default definePreset({
  name: 'nuxthub',
  async setup(options, nuxt) {
    const indexOfNuxtHub = nuxt.options.modules.indexOf('@nuxthub/core')
    const indexOfContentModule = nuxt.options.modules.indexOf('@nuxt/content')

    if (!((nuxt.options as unknown as { hub: { database?: boolean } }).hub?.database) && indexOfNuxtHub < indexOfContentModule) {
      logger.warn('NuxtHub database is not enabled. Please enable it in your NuxtHub configuration. It is recommended to register `@nuxt/content` before `@nuxthub/core`, so that `@nuxt/content` can automatically configure the database if needed.')
    }

    // Make sure database is enabled
    const nuxthubOptions: { database?: boolean } = (nuxt.options as unknown as { hub: unknown }).hub ||= {}
    nuxthubOptions.database = true

    // Set up database
    options.database ||= { type: 'd1', bindingName: 'DB' }
  },
  async setupNitro(nitroConfig, options) {
    if (nitroConfig.runtimeConfig?.content?.database?.type === 'sqlite') {
      logger.warn('Deploying to NuxtHub requires using D1 database, switching to D1 database with binding `DB`.')
      nitroConfig.runtimeConfig!.content!.database = { type: 'd1', bindingName: 'DB' }
    }

    await cfPreset.setupNitro(nitroConfig, options)

    if (nitroConfig.dev === false) {
      // Write SQL dump to database queries when not in dev mode
      await mkdir(resolve(nitroConfig.rootDir!, '.data/hub/database/queries'), { recursive: true })
      let i = 1
      // Drop info table and prepare for new dump
      let dump = 'DROP TABLE IF EXISTS _content_info;\n'
      const dumpFiles: Array<{ file: string, content: string }> = []
      Object.values(options.manifest.dump).forEach((value) => {
        value.forEach((line) => {
          if ((dump.length + line.length) < 1000000) {
            dump += line + '\n'
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
        await writeFile(resolve(nitroConfig.rootDir!, '.data/hub/database/queries', dumpFile.file), dumpFile.content)
      }
      // Disable integrity check in production for performance
      nitroConfig.runtimeConfig ||= {}
      nitroConfig.runtimeConfig.content ||= {}
      nitroConfig.runtimeConfig.content.integrityCheck = false
    }
  },
})
