import {
  addPlugin,
  defineNuxtModule,
  resolveModule,
  addServerMiddleware,
  addTemplate,
  createResolver
} from '@nuxt/kit'
import defu from 'defu'
import { createStorage } from 'unstorage'
import Debounce from 'debounce'
import type { WatchEvent } from 'unstorage'
import { name, version } from '../package.json'
import { contentPluginTemplate, queryPluginTemplate, typeTemplate } from './templates'
import {
  createWebSocket,
  getMountDriver,
  logger,
  MOUNT_PREFIX,
  processMarkdownOptions,
  PROSE_TAGS,
  useContentMounts
} from './utils'

export interface ModuleOptions {
  base: string
  sources: Array<string>
  ignores: Array<string>
  markdown: {
    mdc?: boolean
    toc?: {
      depth?: number
      searchDepth?: number
    },
    tags?: Record<string, string>
    remarkPlugins?: Array<string | [string, any]>
    rehypePlugins?: Array<string | [string, any]>
  }
  yaml: false | Record<string, any>
  navigation: boolean
}

interface ContentContext extends ModuleOptions {
  base: Readonly<string>
  transformers: Array<string>
  queries: Array<string>
}

export interface ModuleHooks {
  'content:context'(ctx: ContentContext): void
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'content',
    compatibility: {
      nuxt: '^3.0.0',
      bridge: true
    }
  },
  defaults: {
    base: '_content',
    sources: ['content'],
    ignores: ['\\.', '-'],
    markdown: {
      tags: Object.fromEntries(PROSE_TAGS.map(t => [t, `prose-${t}`]))
    },
    yaml: {},
    navigation: true
  },
  async setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve('./runtime') })

    const contentContext: ContentContext = {
      transformers: [
        // Register internal content plugins
        resolveRuntimeModule('./server/transformer/plugin-markdown'),
        resolveRuntimeModule('./server/transformer/plugin-yaml'),
        resolveRuntimeModule('./server/transformer/plugin-path-meta')
      ],
      queries: [],
      ...options
    }

    // Initialize runtime config
    nuxt.options.publicRuntimeConfig.content = {
      basePath: options.base
    }
    nuxt.options.privateRuntimeConfig.content = {}

    // Add Vite configurations
    if (nuxt.options.vite !== false) {
      nuxt.options.vite = defu(
        nuxt.options.vite === true ? {} : nuxt.options.vite,
        {
          optimizeDeps: {
            include: ['html-tags']
          }
        }
      )
    }

    // Add server routes
    for (const api of ['list', 'get', 'query', 'highlight']) {
      addServerMiddleware({
        route: `/api/${options.base}/${api}`,
        handle: resolveRuntimeModule(`./server/api/${api}`)
      })
    }

    // Add Content plugin
    addPlugin(resolveRuntimeModule('./plugin'))

    nuxt.hook('nitro:context', (ctx) => {
      // Add module runtime to Nitro inlines
      ctx.externals = defu(ctx.externals, {
        inline: [resolve('./runtime')]
      })

      ctx.alias['#content-plugins'] = nuxt.options.alias['#content-plugins']
      ctx.alias['#query-plugins'] = nuxt.options.alias['#query-plugins']

      // Inline query/content template in Nitro bundle
      ctx.externals = defu(ctx.externals, {
        inline: [ctx.alias['#query-plugins'], ctx.alias['#content-plugins']]
      })

      // Register mounts
      Object.assign(
        ctx.storage.mounts,
        useContentMounts(nuxt, contentContext.sources || [])
      )
    })

    // Add content composables
    nuxt.hook('autoImports:extend', (imports) => {
      const files = [
        {
          path: resolveRuntimeModule('./composables/content'),
          names: [
            'getContentList',
            'useContentList',
            'getContentDocument',
            'useContentDocument'
          ]
        },
        {
          path: resolveRuntimeModule('./composables/query'),
          names: ['useContentQuery']
        },
        {
          path: resolveRuntimeModule('./composables/highlight'),
          names: ['useContentHighlight']
        }
      ]
      for (const { path, names } of files) {
        imports.push(...names.map(name => ({ from: path, name, as: name })))
      }
    })

    // Add components
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        path: resolve('./runtime/components'),
        isAsync: false,
        prefix: '',
        level: 999
      })
    })

    nuxt.hook('prepare:types', ({ references }) => {
      references.push({
        path: resolve(nuxt.options.buildDir, typeTemplate.filename)
      })
    })

    // Register navigation
    if (options.navigation) {
      addServerMiddleware({
        route: `/api/${options.base}/navigation`,
        handle: resolveRuntimeModule('./server/api/navigation')
      })

      nuxt.hook('autoImports:extend', (imports) => {
        imports.push({
          from: resolveRuntimeModule('./composables/navigation'),
          name: 'useContentNavigation',
          as: 'useContentNavigation'
        })
      })
    }

    // @ts-ignore
    await nuxt.callHook('content:context', contentContext)

    contentContext.markdown = processMarkdownOptions(nuxt, contentContext.markdown)

    nuxt.options.publicRuntimeConfig.content.tags = contentContext.markdown.tags
    // Pass content ignore patterns to runtime config, Ignore patterns will use in storage layer
    nuxt.options.privateRuntimeConfig.content = contentContext

    // Add content template
    nuxt.options.alias['#content-plugins'] = addTemplate({ ...contentPluginTemplate, options: contentContext }).dst!
    nuxt.options.alias['#query-plugins'] = addTemplate({ ...queryPluginTemplate, options: contentContext }).dst!
    addTemplate({ ...typeTemplate, options: contentContext })

    // Setup content dev module
    if (!nuxt.options.dev) {
      return
    }

    // Create storage instance
    const storage = createStorage()
    const mounts = useContentMounts(nuxt, contentContext.sources || [])
    for (const mount in mounts) {
      storage.mount(mount, getMountDriver(mounts[mount]))
    }

    const ws = createWebSocket()

    // Create socket server
    nuxt.server
      .listen(0)
      .then(({ url, server }: { url: string; server: any }) => {
        // Inject socket server address into runtime config
        nuxt.options.publicRuntimeConfig.content.wsUrl = url.replace(
          'http',
          'ws'
        )

        server.on('upgrade', ws.serve)

        // Broadcast a message to the server to refresh the page
        // eslint-disable-next-line import/no-named-as-default-member
        const broadcast = Debounce.debounce(ws.broadcast, 200)

        // Watch contents
        storage.watch((event: WatchEvent, key: string) => {
          key = key.substring(MOUNT_PREFIX.length)
          logger.info(`${key} ${event}d`)
          broadcast({ event, key })
        })
      })

    // Dispose storage on nuxt close
    nuxt.hook('close', () => {
      storage.dispose()
      ws.close()
    })
  }
})

interface ModulePublicRuntimeConfig {
  tags: Record<string, string>
  basePath?: string;
  // Websocket server URL
  wsUrl?: string;
}

interface ModulePrivateRuntimeConfig {
}

declare module '@nuxt/schema' {
  interface ConfigSchema {
    publicRuntimeConfig?: {
      content?: ModulePublicRuntimeConfig;
    };
    privateRuntimeConfig?: {
      content?: ModulePrivateRuntimeConfig & ContentContext;
    };
  }
}
