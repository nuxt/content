import { addTemplate } from '@nuxt/kit'
import { sqlDumpTemplate } from '../utils/templates'
import { definePreset } from '../utils/preset'

export default definePreset({
  setupNitro(nitroConfig, { manifest, resolver }) {
    nitroConfig.publicAssets ||= []
    nitroConfig.alias = nitroConfig.alias || {}
    nitroConfig.handlers ||= []

    nitroConfig.alias['#content/dump'] = addTemplate(sqlDumpTemplate(manifest)).dst
    nitroConfig.handlers.push({
      route: '/api/content/:collection/database.sql',
      handler: resolver.resolve('./runtime/presets/node/database.sql'),
    })
  },
})
