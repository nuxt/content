import { addTemplate, createResolver } from '@nuxt/kit'
import { sqlDumpTemplate } from '../../utils/templates'
import { definePreset } from '../../utils/preset'

export default definePreset({
  setupNitro(_options, nitroConfig, manifest) {
    const { resolve } = createResolver(import.meta.url)
    nitroConfig.publicAssets ||= []
    nitroConfig.alias = nitroConfig.alias || {}
    nitroConfig.handlers ||= []

    nitroConfig.alias['#content/dump'] = addTemplate(sqlDumpTemplate(manifest)).dst
    nitroConfig.handlers.push({ route: '/api/content/:collection/database.sql', handler: resolve('./database.sql') })
  },
})
