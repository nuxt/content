import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'pathe'
import { definePreset } from '../utils/preset'
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
  },
})
