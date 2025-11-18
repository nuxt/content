import { addServerHandler, addTemplate, createResolver } from '@nuxt/kit'
import { fullDatabaseCompressedDumpTemplate } from '../utils/templates'
import { definePreset } from '../utils/preset'

export default definePreset({
  name: 'node',
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)
    addServerHandler({
      route: '/__nuxt_content/:collection/sql_dump.txt',
      handler: resolver.resolve('./runtime/presets/node/database-handler'),
    })
  },
  setupNitro(nitroConfig, { manifest }) {
    nitroConfig.publicAssets ||= []
    nitroConfig.alias = nitroConfig.alias || {}
    nitroConfig.handlers ||= []

    nitroConfig.alias['#content/dump'] = addTemplate(fullDatabaseCompressedDumpTemplate(manifest)).dst
  },
})
