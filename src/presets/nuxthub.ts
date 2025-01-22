import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'pathe'
import { getPlatformProxy } from 'wrangler'
import { definePreset } from '../utils/preset'
import type { D1DatabaseConfig } from '../types'
import cfPreset from './cloudflare-pages'

export default definePreset({
  name: 'nuxthub',
  async setupNitro(nitroConfig, options) {
    await cfPreset.setupNitro(nitroConfig, options)

    if (nitroConfig.dev === false) {
      // Write SQL dump to database queries when not in dev mode
      const sql = Object.values(options.manifest.dump).map(value => value.join('\n')).join('\n')
      await mkdir(resolve(nitroConfig.rootDir, '.data/hub/database/queries'), { recursive: true })
      await writeFile(resolve(nitroConfig.rootDir, '.data/hub/database/queries/content-database.sql'), sql)
      // Disable integrity check in production for performance
      nitroConfig.runtimeConfig.content.integrityCheck = false
    }

    if (nitroConfig.dev) {
      // @ts-expect-error nitroConfig.cloudflareDev is not typed and filled by NuxtHub
      const cloudflareDev = nitroConfig.cloudflareDev
      const proxyOptions = {
        configPath: cloudflareDev.configPath,
        persist: { path: cloudflareDev.persistDir },
      }

      const proxy = await getPlatformProxy(proxyOptions)
      // @ts-expect-error _cf_env_ is not typed
      globalThis.__cf_env__ = proxy.env

      const localDatabase: D1DatabaseConfig = { type: 'd1', bindingName: 'DB' }
      nitroConfig.runtimeConfig!.content!.localDatabase = localDatabase
      options.moduleOptions._localDatabase = localDatabase
    }
  },
})
