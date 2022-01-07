import { addPlugin, defineNuxtModule, resolveModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { runtimeDir } from './dirs'
import { setupContentModule } from './module/content'

export default defineNuxtModule({
  meta: {
    name: 'docus',
    compatibility: {
      nuxt: '>=3.0.0',
      bridge: true
    },
    version: '3',
    configKey: 'docus'
  },
  defaults: {
    content: {
      sources: ['content'],
      ignores: ['\\.', '-']
    }
  },
  setup(options, nuxt) {
    // Setup runtime alias
    nuxt.options.alias['#docus'] = runtimeDir

    // Initialize Docus runtime config
    nuxt.options.publicRuntimeConfig.docus = {}
    nuxt.options.privateRuntimeConfig.docus = {}

    // Setup content module
    setupContentModule(options, nuxt as unknown as Nuxt)

    // Add Docus plugin
    addPlugin(resolveModule('./index', { paths: runtimeDir }))
  }
})
