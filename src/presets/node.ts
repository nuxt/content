import { addTemplate } from '@nuxt/kit'
import { fullDatabaseCompressedDumpTemplate } from '../utils/templates'
import { definePreset } from '../utils/preset'

export default definePreset({
  name: 'node',
  setupNitro(nitro, { manifest, resolver }) {
    nitro.options.publicAssets ||= []
    nitro.options.alias = nitro.options.alias || {}
    nitro.options.handlers ||= []

    nitro.options.alias['#content/dump'] = addTemplate(fullDatabaseCompressedDumpTemplate(manifest)).dst
    nitro.options.handlers.push({
      route: '/__nuxt_content/:collection/sql_dump.txt',
      handler: resolver.resolve('./runtime/presets/node/database-handler'),
    })
  },
})
