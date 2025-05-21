import { addTemplate } from '@nuxt/kit'
import { fullDatabaseCompressedDumpTemplate } from '../utils/templates'
import { definePreset } from '../utils/preset'

export default definePreset({
  name: 'node',
  setupNitro(nitroConfig, { manifest, resolver }) {
    nitroConfig.publicAssets ||= []
    nitroConfig.alias = nitroConfig.alias || {}
    nitroConfig.handlers ||= []

    nitroConfig.alias['#content/dump'] = addTemplate(fullDatabaseCompressedDumpTemplate(manifest)).dst
    nitroConfig.handlers.push({
      route: '/__nuxt_content/:collection/sql_dump.txt',
      handler: resolver.resolve('./runtime/presets/node/database-handler'),
    })
  },
})
