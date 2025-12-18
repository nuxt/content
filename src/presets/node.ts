import { addServerHandler, addTemplate } from '@nuxt/kit'
import { fullDatabaseCompressedDumpTemplate } from '../utils/templates'
import { definePreset } from '../utils/preset'

export default definePreset({
  name: 'node',
  setup(_options, _nuxt, { resolver, manifest }) {
    // Due to prerender enabling in the module, Nuxt create a route for each collection
    // These routes cause issue while enabling cache in Nuxt.
    // So we need to add a server handler for each collection to handle the request.
    manifest.collections.map((collection) => {
      addServerHandler({
        route: `/__nuxt_content/${collection.name}/sql_dump.txt`,
        handler: resolver.resolve('./runtime/presets/node/database-handler'),
      })
    })
  },
  setupNitro(nitroConfig, { manifest }) {
    nitroConfig.publicAssets ||= []
    nitroConfig.alias = nitroConfig.alias || {}
    nitroConfig.handlers ||= []

    nitroConfig.alias['#content/dump'] = addTemplate(fullDatabaseCompressedDumpTemplate(manifest)).dst
  },
})
