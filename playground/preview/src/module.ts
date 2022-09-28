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
    baseURL: 'http://localhost:1337'
  },
  setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve('./runtime') })
    addPlugin(resolveRuntimeModule('./preview'))

    nuxt.options.runtimeConfig.public.studio = {
      baseURL: options.baseURL
    }

    addComponent({
      name: 'ContentPreviewMode',
      filePath: resolveRuntimeModule('./components/ContentPreviewMode.vue')
    })
  }
})
