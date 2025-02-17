import defu from 'defu'
import { addPrerenderRoutes, addServerScanDir, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import type { ModuleOptions as ContentModuleOptions } from '@nuxt/content'

export default defineNuxtModule({
  meta: {
    name: 'Content LLMS',
    configKey: 'contentLLMS',
  },
  setup(opts, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const logger = useLogger('@nuxt/content/llms')

    const options = defu(opts, (nuxt.options as unknown as { content: ContentModuleOptions }).content?.features?.llms)

    nuxt.options.runtimeConfig.llms = {
      domain: options.domain,
      title: options.title,
      description: options.description,
      notes: options.notes,
      sections: options.sections || [{ title: 'Docs', collection: 'content' }],
    }

    if (!options.domain) {
      logger.warn('Please provide a domain for the LLMs module. LLMS docs require a domain to be set. `content.features.llms.domain` is missing.')
    }

    addServerScanDir(resolve('runtime/server'))

    addPrerenderRoutes('/llms.txt')
    addPrerenderRoutes('/llms_full.txt')
  },
})
