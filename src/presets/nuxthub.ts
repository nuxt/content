import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'pathe'
import { logger } from '../utils/dev'
import { definePreset } from '../utils/preset'
import cfPreset from './cloudflare'

export default definePreset({
  name: 'nuxthub',
  async setup(options, nuxt) {
    if (!((nuxt.options as unknown as { hub: { database?: boolean | string } }).hub?.database)) {
      logger.warn('NuxtHub dedected but `hub.database` is not enabled. Using local SQLite as default database instead.')
      return
    }

    // Read from the final hub database configuration
    const hubDb = nuxt.options.dev ? nuxt.options.nitro.devDatabase?.db : nuxt.options.nitro.database?.db
    // Set up database
    if (typeof nuxt.options.hub?.database === 'string' && hubDb) {
      const type = hubDb.connector === 'better-sqlite3' ? 'sqlite' : hubDb.connector
      options.database = { type, ...hubDb.options }
    } else if (nuxt.options.hub?.database === true) {
      options.database ||= { type: 'd1', bindingName: 'DB' }
    }
  },
  async setupNitro(nitro, options) {
    const { nuxt } = options
    // NuxtHub < v1
    if (nuxt.options.hub?.database === true) {
      if (nitro.options.runtimeConfig?.content?.database?.type === 'sqlite') {
        logger.warn('Deploying to NuxtHub requires using D1 database, switching to D1 database with binding `DB`.')
        nitro.options.runtimeConfig!.content!.database = { type: 'd1', bindingName: 'DB' }
      }
      await cfPreset.setupNitro(nitro, options)
    } else if (typeof nuxt.options.hub?.database === 'string') {
      // set and interval all 10ms until nitro.options.database.db.connector is not undefined
      // it must be a promise that resolves when the valus is not undefined, with a timeout of 5 seconds
      const hubDb = await new Promise((resolve) => {
        const interval = setInterval(() => {
          const db = nuxt.options._prepare || nuxt.options.dev ? nitro.options.devDatabase?.db : nitro.options.database?.db
          if (db) {
            clearInterval(interval)
            resolve(db)
          }
        }, 10)
        setTimeout(() => {
          clearInterval(interval)
          resolve(false)
        }, 5000)
      })
      if (hubDb) {
        const type = hubDb.connector === 'better-sqlite3' ? 'sqlite' : hubDb.connector
        nitro.options.runtimeConfig!.content!.database = { type, ...hubDb.options }
      } else {
        throw new Error('Could not find NuxtHub database')
      }
    }

    if (nitro.options.dev === false) {
      // Write SQL dump to database queries when not in dev mode
      await mkdir(resolve(nitro.options.rootDir!, '.data/hub/database/queries'), { recursive: true })
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
        await writeFile(resolve(nitro.options.rootDir!, '.data/hub/database/queries', dumpFile.file), dumpFile.content)
      }
      // Disable integrity check in production for performance
      nitro.options.runtimeConfig!.content ||= {}
      nitro.options.runtimeConfig.content.integrityCheck = false
    }
  },
})
