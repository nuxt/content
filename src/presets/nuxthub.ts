import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'pathe'
import { provider } from 'std-env'
import { logger } from '../utils/dev'
import { definePreset } from '../utils/preset'
import type { Nuxt } from 'nuxt/schema'
import type { LibSQLDatabaseConfig, PGliteDatabaseConfig, SqliteDatabaseConfig } from '~/dist/module.mjs'
import cloudflarePreset from './cloudflare'
import nodePreset from './node'

export default definePreset({
  name: 'nuxthub',
  async setup(options, nuxt) {
    if (!((nuxt.options as unknown as { hub: { database?: unknown } }).hub?.database)) {
      logger.warn('NuxtHub dedected but `hub.database` is not enabled. Using local SQLite as default database instead.')
      return
    }

    const runtimeConfig = nuxt.options.runtimeConfig as unknown as { hub: { database?: boolean | { driver: string, connection: { url?: string } } } }
    const nuxtOptions = nuxt.options as unknown as { hub: { database?: boolean | string | object } }
    // Read from the final hub database configuration
    const hubDb = runtimeConfig.hub.database
    // NuxtHub < 1
    if (nuxtOptions.hub?.database === true) {
      options.database ||= { type: 'd1', bindingName: 'DB' }
    }
    else if (typeof nuxtOptions.hub?.database === 'string' && typeof hubDb === 'object') {
      if (hubDb.driver === 'd1') {
        options.database ||= { type: 'd1', bindingName: 'DB' }
      }
      else if (hubDb.driver === 'node-postgres') {
        options.database ||= { type: 'postgresql', url: hubDb.connection.url as string }
      }
      else {
        options.database ||= { type: hubDb.driver as 'sqlite' | 'postgresql' | 'postgres' | 'libsql' | 'pglite', ...hubDb.connection } as unknown as SqliteDatabaseConfig | LibSQLDatabaseConfig | PGliteDatabaseConfig
      }
    }
  },
  async setupNitro(nitroConfig, options) {
    const { nuxt } = options as unknown as { nuxt: Nuxt & { options: { hub: { database?: boolean | object } } } }
    const hubConfig = nuxt.options.runtimeConfig.hub as unknown as { database: unknown & { applyMigrationsDuringBuild?: boolean }, dir: string }
    // NuxtHub < v1
    if (nuxt.options.hub?.database === true) {
      if (nitroConfig.runtimeConfig?.content?.database?.type === 'sqlite') {
        logger.warn('Deploying with NuxtHub < 1 requires using D1 database, switching to D1 database with binding `DB`.')
        nitroConfig.runtimeConfig!.content!.database = { type: 'd1', bindingName: 'DB' }
      }
    }
    else if (typeof nuxt.options.hub?.database === 'string') {
      const hubDb = hubConfig.database as unknown as { driver: string, connection: object }
      if (hubDb.driver === 'd1') {
        nitroConfig.runtimeConfig!.content!.database ||= { type: 'd1', bindingName: 'DB' }
      }
      else if (hubDb.driver === 'node-postgres') {
        nitroConfig.runtimeConfig!.content!.database ||= { type: 'postgresql', ...hubDb.connection }
      }
      else {
        nitroConfig.runtimeConfig!.content!.database ||= { type: hubDb.driver, ...hubDb.connection }
      }
    }

    // apply migrations during build if enabled
    if (!nuxt.options.dev && hubConfig.database?.applyMigrationsDuringBuild) {
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
    // Handle local database (cannot be populated during build)
    const database = nitroConfig.runtimeConfig?.content?.database
    if (!nuxt.options.dev && database?.type === 'libsql' && database?.url?.startsWith('file:') && !database?.url?.startsWith('file:/tmp/')) {
      logger.warn('Deploying local libsql database with Nuxthub is possible only in `/tmp` directory. Using `/tmp/sqlite.db` instead.')
      database.url = 'file:/tmp/sqlite.db'
      // Enable integrity check in production as local database cannot be re-used after build
      nitroConfig.runtimeConfig!.content ||= {}
      nitroConfig.runtimeConfig!.content.integrityCheck = true
    }

    const preset = (process.env.NITRO_PRESET || nuxt.options.nitro.preset || provider).replace(/_/g, '-')
    if (preset.includes('cloudflare')) {
      await cloudflarePreset.setupNitro(nitroConfig, options)
    }
    else {
      await nodePreset.setupNitro(nitroConfig, options)
    }
  },
})
