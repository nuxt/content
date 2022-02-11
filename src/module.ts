import { fileURLToPath, URL } from 'url'
import {
  addPlugin,
  defineNuxtModule,
  resolveModule,
  addServerMiddleware,
  addTemplate
} from '@nuxt/kit'
import defu from 'defu'
import { resolve } from 'pathe'
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
  useContentMounts
} from './utils'

export interface ModuleOptions {
  base: string;
  sources: Array<string>;
  ignores: Array<string>;
  markdown: false | Record<string, any>;
  yaml: false | Record<string, any>;
  navigation: boolean;
}

export interface ModuleHooks {}

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
    markdown: {},
    yaml: {},
    navigation: true
  },
  setup (options, nuxt) {
    // TODO: Use createResolver
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    const resolveRuntimeDir = (...p: string[]) => resolve(runtimeDir, ...p)

    const context = {
      transformers: [
        // Register internal content plugins
        resolveModule('./server/transformer/plugin-markdown', {
          paths: runtimeDir
        }),
        resolveModule('./server/transformer/plugin-yaml', {
          paths: runtimeDir
        }),
        resolveModule('./server/transformer/plugin-path-meta', {
          paths: runtimeDir
        })
      ],
      queries: []
    }
    // Initialize Docus runtime config
    nuxt.options.publicRuntimeConfig.content = {}
    nuxt.options.privateRuntimeConfig.content = {}

    //  Set api base path
    nuxt.options.publicRuntimeConfig.content.basePath = options.base

    // Pass content ignore patterns to runtime config, Ignore patterns will use in storage layer
    nuxt.options.privateRuntimeConfig.content.ignores = options.ignores

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
    for (const api of ['list', 'get', 'query']) {
      addServerMiddleware({
        route: `/api/${options.base}/${api}`,
        handle: resolveModule(`./server/api/${api}`, { paths: runtimeDir })
      })
    }

    // Add Content plugin
    addPlugin(resolveModule('./plugin', { paths: runtimeDir }))

    // Add content template
    nuxt.options.alias['#content-plugins'] = addTemplate({
      ...contentPluginTemplate,
      options: context
    }).dst!
    nuxt.options.alias['#query-plugins'] = addTemplate({
      ...queryPluginTemplate,
      options: context
    }).dst!
    addTemplate({
      ...typeTemplate,
      options
    })

    nuxt.hook('nitro:context', (ctx) => {
      ctx.alias['#content-plugins'] = nuxt.options.alias['#content-plugins']

      // Inline content template in Nitro bundle
      ctx.externals = defu(ctx.externals, {
        inline: [ctx.alias['#content-plugins']]
      })
    })

    nuxt.hook('nitro:context', (ctx) => {
      // Register mounts
      Object.assign(
        ctx.storage.mounts,
        useContentMounts(nuxt, options.sources || [])
      )
    })

    // Add content composables
    nuxt.hook('autoImports:extend', (imports) => {
      const files = [
        {
          path: resolveModule('./composables/content', { paths: runtimeDir }),
          names: [
            'getContentList',
            'useContentList',
            'getContentDocument',
            'useContentDocument'
          ]
        },
        {
          path: resolveModule('./composables/query', { paths: runtimeDir }),
          names: ['useContentQuery']
        }
      ]
      for (const { path, names } of files) {
        imports.push(...names.map(name => ({ from: path, name, as: name })))
      }
    })

    // Add components
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        path: resolveRuntimeDir('components'),
        isAsync: false,
        prefix: '',
        level: 999
      })
    })

    nuxt.hook('nitro:context', (ctx) => {
      ctx.alias['#query-plugins'] = nuxt.options.alias['#query-plugins']

      // Inline query template in Nitro bundle
      ctx.externals = defu(ctx.externals, {
        inline: [ctx.alias['#query-plugins']]
      })
    })

    nuxt.hook('prepare:types', ({ references }) => {
      references.push({
        path: resolve(nuxt.options.buildDir, 'content-query.d.ts')
      })
    })

    // Register navigation
    if (options.navigation) {
      addServerMiddleware({
        route: `/api/${options.base}/navigation`,
        handle: resolveModule('./server/api/navigation', { paths: runtimeDir })
      })

      nuxt.hook('autoImports:extend', (imports) => {
        imports.push({
          from: resolveModule('./composables/navigation', { paths: runtimeDir }),
          name: 'useContentNavigation',
          as: 'useContentNavigation'
        })
      })
    }

    // Setup content dev module
    if (!nuxt.options.dev) {
      return
    }

    // Create storage instance
    const storage = createStorage()
    const mounts = useContentMounts(nuxt, options.sources || [])
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
  basePath?: string;
  // Websocket server URL
  wsUrl?: string;
}

interface ModulePrivateRuntimeConfig {
  // List of content ignore patterns
  ignores: Array<string>;
}

declare module '@nuxt/schema' {
  interface ConfigSchema {
    publicRuntimeConfig?: {
      content?: ModulePublicRuntimeConfig;
    };
    privateRuntimeConfig?: {
      content?: ModulePrivateRuntimeConfig & ModulePublicRuntimeConfig;
    };
  }
}
