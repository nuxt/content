import { addTemplate, createResolver } from '@nuxt/kit'
import { join } from 'pathe'
import { sqlDumpTemplateRaw } from '../../utils/templates'
import { definePreset } from '../../utils/preset'
import { logger } from '../../utils/dev'

export default definePreset({
  async setupNitro(_options, nitroConfig, manifest) {
    if (nitroConfig.runtimeConfig?.content.database?.type !== 'd1') {
      logger.warn('Deployin to Cloudflare Pages requires using D1 database, switching to D1 database with binding `DB`.')
      nitroConfig.runtimeConfig!.content.database = {
        type: 'd1',
        binding: 'DB',
      }
    }

    const { resolve } = createResolver(import.meta.url)
    nitroConfig.publicAssets ||= []
    nitroConfig.alias = nitroConfig.alias || {}
    nitroConfig.handlers ||= []

    // Add raw content dump
    manifest.collections.map(async (collection) => {
      if (!collection.private) {
        addTemplate(sqlDumpTemplateRaw(collection.name, manifest))
      }
    })

    // Add raw content dump to public assets
    nitroConfig.publicAssets.push({ dir: join(nitroConfig.buildDir!, 'content', 'raw'), maxAge: 60 })
    nitroConfig.handlers.push({ route: '/api/content/:collection/database.sql', handler: resolve('./database.sql') })
  },

})
