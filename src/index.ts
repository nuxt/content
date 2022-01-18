import { addPlugin, defineNuxtModule, resolveModule } from '@nuxt/kit'
import { resolveRuntimeDir, runtimeDir } from './dirs'
import { setupContentModule } from './module/content'
import { setupQueryModule } from './module/query'

export interface ModuleOptions {
  content?: {
    sources?: Array<string>
    ignores?: Array<string>
  }
  query?: {
    plugins?: Array<string>
  }
}

export default defineNuxtModule<ModuleOptions>({
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
    },
    query: {
      plugins: []
    }
  },
  setup(options, nuxt) {
    // Initialize Docus runtime config
    nuxt.options.publicRuntimeConfig.docus = {}
    nuxt.options.privateRuntimeConfig.docus = {}

    // Setup content module
    setupContentModule(options, nuxt)

    // Setup query module
    setupQueryModule(options, nuxt)

    // Add Docus plugin
    addPlugin(resolveModule('./plugin', { paths: runtimeDir }))

    // Setup runtime alias
    nuxt.options.alias['#docus'] = resolveModule('./index', { paths: runtimeDir })
    nuxt.hook('nitro:context', ctx => {
      ctx.alias['#docus'] = nuxt.options.alias['#docus']
    })

    // Add docus composables
    nuxt.hook('autoImports:dirs', dirs => {
      dirs.push(resolveRuntimeDir('composables'))
    })
  }
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    docus?: ModuleOptions
  }
  interface NuxtOptions {
    docus?: ModuleOptions
  }
}
