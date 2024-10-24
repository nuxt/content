import { addTemplate, createResolver } from '@nuxt/kit'
import { join } from 'pathe'
import { sqlDumpTemplateRaw } from '../../utils/templates'
import { definePreset } from '../../utils/preset'

export default definePreset({
  setup(options, nuxt, manifest) {
    if (options.database?.type !== 'd1') {
      options.database = {
        type: 'd1',
        binding: 'DB',
      }
    }

    const { resolve } = createResolver(import.meta.url)
    nuxt.hook('nitro:config', (config) => {
      config.publicAssets ||= []
      config.alias = config.alias || {}
      config.handlers ||= []

      // Add raw content dump
      addTemplate(sqlDumpTemplateRaw(manifest))
      // Add raw content dump to public assets
      config.publicAssets.push({ dir: join(nuxt.options.buildDir, 'content', 'raw'), maxAge: 60 })

      config.handlers.push({ route: '/api/content/database.sql', handler: resolve('./database.sql') })
    })
  },
})
