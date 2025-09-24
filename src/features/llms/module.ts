import defu from 'defu'
import { createResolver, defineNuxtModule, addTypeTemplate, addServerPlugin } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'Content LLMS',
    configKey: 'content.llms',
  },
  setup(_opts, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    addServerPlugin(resolve('runtime/server/content-llms.plugin'))

    const typeTemplate = addTypeTemplate({
      filename: 'content/llms.d.ts' as `${string}.d.ts`,
      getContents: () => {
        return `
import type { SQLOperator, PageCollections, PageCollectionItemBase } from '@nuxt/content'
declare module 'nuxt-llms' {
  interface LLMsSection {
    contentCollection?: keyof PageCollections
    contentFilters?: Array<{
      field: string
      operator: SQLOperator
      value?: string
    }>
  }
}

declare module 'nitropack/types' {
  interface NitroRuntimeHooks {
    'content:llms:generate:document': (event: H3Event, doc: PageCollectionItemBase, options: ModuleOptions) => void
  }
}

        `
      },
      write: true,
    }).dst
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.typescript ||= {}
    nuxt.options.nitro.typescript.tsConfig = defu(nuxt.options.nitro.typescript.tsConfig, {
      include: [typeTemplate],
    })
  },
})
