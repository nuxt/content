import { addTemplate } from '@nuxt/kit'
import { join } from 'pathe'
import { logger } from '../utils/dev'
import { definePreset } from '../utils/preset'
import { collectionDumpTemplate } from '../utils/templates'

export default definePreset({
  name: 'cloudflare',
  async setupNitro(nitro, { manifest, resolver }) {
    if (nitro.options.runtimeConfig?.content?.database?.type === 'sqlite') {
      logger.warn('Deploying to Cloudflare requires using D1 database, switching to D1 database with binding `DB`.')
      nitro.options.runtimeConfig!.content!.database = { type: 'd1', bindingName: 'DB' }
    }

    nitro.options.publicAssets ||= []
    nitro.options.alias = nitro.options.alias || {}
    nitro.options.handlers ||= []

    // Add raw content dump
    manifest.collections.map(async (collection) => {
      if (!collection.private) {
        addTemplate(collectionDumpTemplate(collection.name, manifest))
      }
    })

    // Add raw content dump to public assets
    nitro.options.publicAssets.push({ dir: join(nitro.options.buildDir!, 'content', 'raw'), maxAge: 60 })
    nitro.options.handlers.push({
      route: '/__nuxt_content/:collection/sql_dump.txt',
      handler: resolver.resolve('./runtime/presets/cloudflare/database-handler'),
    })
  },

})
