import {
  addPlugin,
  defineNuxtModule,
  resolveModule,
  createResolver,
  addComponent
} from '@nuxt/kit'

export interface ModuleOptions {
  baseURL?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    configKey: 'studio',
    compatibility: {
      nuxt: '^3.0.0-rc.10'
    }
  },
  defaults: {
    baseURL: undefined
  },
  setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve('./runtime') })

    // Enable preview mode under experimental flag
    if (!process.env.EXPERIMENTAL_LIVE_PREVIEW_URL) {
      return
    }

    // Add preview plugin
    addPlugin(resolveRuntimeModule('./preview'))

    // Add preview components
    addComponent({
      name: 'ContentPreviewMode',
      filePath: resolveRuntimeModule('./components/ContentPreviewMode.vue')
    })

    nuxt.options.runtimeConfig.public.studio = {
      baseURL: options.baseURL || process.env.EXPERIMENTAL_LIVE_PREVIEW_URL
    }
  }
})
