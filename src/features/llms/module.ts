import defu from 'defu'
import { createResolver, defineNuxtModule, addTypeTemplate, addServerPlugin, addServerHandler } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'Content LLMS',
    configKey: 'content.llms',
  },
  setup(_opts, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    addServerPlugin(resolve('runtime/server/content-llms.plugin'))
    if ((nuxt.options as unknown as { llms: { contentRawMD: false | { excludeCollections: string[] } } })?.llms?.contentRawMD !== false) {
      addServerHandler({ route: '/raw/**:slug.md', handler: resolve('runtime/server/routes/raw/[...slug].md.get') })
    }

    const typeTemplate = addTypeTemplate({
      filename: 'content/llms.d.ts' as `${string}.d.ts`,
      getContents: () => {
        return `
import type { SQLOperator, PageCollections, PageCollectionItemBase } from '@nuxt/content'
declare module 'nuxt-llms' {
  interface ModuleOptions {
    contentRawMD?: false | {
      excludeCollections?: string[]
    }
  }
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
