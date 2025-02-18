import defu from 'defu'
import { addPrerenderRoutes, addServerScanDir, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import type { ModuleOptions as ContentModuleOptions, RuntimeConfig } from '@nuxt/content'
import type { LLMSOptions } from './runtime/types'

export default defineNuxtModule<LLMSOptions>({
  meta: {
    name: 'Content LLMS',
    configKey: 'content.llms',
  },
  setup(opts, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const logger = useLogger('@nuxt/content/llms')

    const options = defu(opts, (nuxt.options as unknown as { content: ContentModuleOptions }).content?.llms)
    if (!options.domain) {
      logger.warn('LLMS docs require a domain to be set. `content.llms.domain` is missing.')
    }

    addServerScanDir(resolve('runtime/server'))
    addPrerenderRoutes('/llms.txt')

    if (options.llmsFull) {
      options.sections.unshift({
        title: 'Documentation Sets',
        description: options.llmsFull.description,
        links: [
          {
            title: options.llmsFull.title,
            description: options.llmsFull.description,
            href: `${options.domain}/llms_full.txt`,
          },
        ],
      })
      addPrerenderRoutes('/llms_full.txt')
    }

    nuxt.options.runtimeConfig.content ||= {} as RuntimeConfig['content']
    nuxt.options.runtimeConfig.content = Object.assign(nuxt.options.runtimeConfig.content, {
      llms: {
        domain: options.domain,
        title: options.title,
        description: options.description,
        notes: options.notes,
        sections: options.sections || [{ title: 'Docs', collection: 'content' }],
      },
    })
  },
})
