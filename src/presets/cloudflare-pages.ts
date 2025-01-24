import { addTemplate } from '@nuxt/kit'
import { join } from 'pathe'
import { collectionDumpTemplate } from '../utils/templates'
import { definePreset } from '../utils/preset'
import { logger } from '../utils/dev'

export default definePreset({
  name: 'cloudflare-pages',
  async setupNitro(nitroConfig, { manifest, resolver }) {
    if (nitroConfig.runtimeConfig?.content?.database?.type === 'sqlite') {
      logger.warn('Deploying to Cloudflare Pages requires using D1 database, switching to D1 database with binding `DB`.')
      nitroConfig.runtimeConfig!.content!.database = {
        type: 'd1',
        binding: 'DB',
      }
    }

    nitroConfig.publicAssets ||= []
    nitroConfig.alias = nitroConfig.alias || {}
    nitroConfig.handlers ||= []

    // Add raw content dump
    manifest.collections.map(async (collection) => {
      if (!collection.private) {
        addTemplate(collectionDumpTemplate(collection.name, manifest))
      }
    })

    // Add raw content dump to public assets
    nitroConfig.publicAssets.push({ dir: join(nitroConfig.buildDir!, 'content', 'raw'), maxAge: 60 })
    nitroConfig.handlers.push({
      route: '/api/content/:collection/database.sql',
      handler: resolver.resolve('./runtime/presets/cloudflare-pages/database-handler'),
    })
  },

})
