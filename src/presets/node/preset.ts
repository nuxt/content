import { addTemplate, createResolver } from '@nuxt/kit'
import { sqlDumpTemplate } from '../../utils/templates'
import { definePreset } from '../../utils/preset'

export default definePreset({
  defaults: () => ({
    database: {
      type: 'sqlite',
      filename: './contents.sqlite',
    },
  }),
  setup(_options, nuxt, manifest) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.hook('nitro:config', (config) => {
      config.publicAssets ||= []
      config.alias = config.alias || {}
      config.handlers ||= []

      config.alias['#content/dump'] = addTemplate(sqlDumpTemplate(manifest)).dst
      config.handlers.push({ route: '/api/content/database.sql', handler: resolve('./database.sql') })
    })
  },
})
