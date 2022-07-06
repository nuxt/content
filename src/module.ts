import fs from 'fs'
import {
  addPlugin,
  defineNuxtModule,
  resolveModule,
  createResolver,
  addAutoImport,
  addComponentsDir,
  templateUtils,
  addTemplate
} from '@nuxt/kit'
import type { ListenOptions } from 'listhen'
// eslint-disable-next-line import/no-named-as-default
import defu from 'defu'
import { hash } from 'ohash'
import { join } from 'pathe'
import type { Lang as ShikiLang, Theme as ShikiTheme } from 'shiki-es'
import { listen } from 'listhen'
import type { WatchEvent } from 'unstorage'
import { withTrailingSlash } from 'ufo'
import { name, version } from '../package.json'
import {
  CACHE_VERSION,
  createWebSocket,
  logger,
  MOUNT_PREFIX,
  processMarkdownOptions,
  PROSE_TAGS,
  useContentMounts
} from './utils'
import type { MarkdownPlugin, QueryBuilderParams } from './runtime/types'

export type MountOptions = {
  driver: 'fs' | 'http' | string
  name?: string
  prefix?: string
  [options: string]: any
}

export interface ModuleOptions {
  /**
   * Base route that will be used for content api
   *
   * @default '_content'
   */
  base: string
  /**
   * Disable content watcher and hot content reload.
   * Note: Watcher is a development feature and will not includes in the production.
   *
   * @default true
   */
  watch: false | {
    ws: Partial<ListenOptions>
  }
  /**
   * Contents can located in multiple places, in multiple directories or even in remote git repositories.
   * Using sources option you can tell Content module where to look for contents.
   *
   * @default ['content']
   */
  sources: Record<string, MountOptions> | Array<string | MountOptions>
  /**
   * List of ignore pattern that will be used for excluding content from parsing and rendering.
   *
   * @default ['\\.', '-']
   */
  ignores: Array<string>
  /**
   * Content module uses `remark` and `rehype` under the hood to compile markdown files.
   * You can modify this options to control its behavior.
   */
  markdown: {
    /**
     * Whether MDC syntax should be supported or not.
     *
     * @default true
     */
    mdc?: boolean
    /**
     * Control behavior of Table of Contents generation
     */
    toc?: {
      /**
       * Maximum heading depth that includes in the table of contents.
       *
       * @default 2
       */
      depth?: number
      /**
       * Maximum depth of nested tags to search for heading.
       *
       * @default 2
       */
      searchDepth?: number
    },
    /**
     * Tags will be used to replace markdown components and render custom components instead of default ones.
     *
     * @default {}
     */
    tags?: Record<string, string>
    /**
     * Register custom remark plugin to provide new feature into your markdown contents.
     * Checkout: https://github.com/remarkjs/remark/blob/main/doc/plugins.md
     *
     * @default []
     */
    remarkPlugins?: Array<string | [string, MarkdownPlugin]> | Record<string, false | MarkdownPlugin>
    /**
     * Register custom remark plugin to provide new feature into your markdown contents.
     * Checkout: https://github.com/rehypejs/rehype/blob/main/doc/plugins.md
     *
     * @default []
     */
    rehypePlugins?: Array<string | [string, MarkdownPlugin]> | Record<string, false | MarkdownPlugin>
  }
  /**
   * Content module uses `shiki` to highlight code blocks.
   * You can configure Shiki options to control its behavior.
   */
  highlight: false | {
    /**
     * Default theme that will be used for highlighting code blocks.
     */
    theme?: ShikiTheme | {
      default: ShikiTheme
      [theme: string]: ShikiTheme
    },
    /**
     * Preloaded languages that will be available for highlighting code blocks.
     */
    preload?: ShikiLang[]
  },
  /**
   * Options for yaml parser.
   *
   * @default {}
   */
  yaml: false | Record<string, any>
  /**
   * Options for yaml parser.
   *
   * @default {}
   */
  csv: false | Record<string, any>
  /**
   * Enable/Disable navigation.
   *
   * @default {}
   */
  navigation: false | {
    fields: Array<string>
  }
  /**
   * List of locale codes.
   * This codes will be used to detect contents locale.
   *
   * @default []
   */
  locales: Array<string>
  /**
   * Default locale for top level contents.
   *
   * @default undefined
   */
  defaultLocale?: string
  /**
   * Document-driven mode config
   */
  documentDriven: boolean | {
    page: boolean
    navigation: boolean
    surround: boolean
    globals: {
      [key: string]: QueryBuilderParams
    }
    layoutFallbacks: string[]
    injectPage: boolean
  }
}

interface ContentContext extends ModuleOptions {
  base: Readonly<string>
  transformers: Array<string>
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
      nuxt: '^3.0.0-rc.3'
    }
  },
  defaults: {
    base: '_content',
    watch: {
      ws: {
        port: 4000,
        showURL: false
      }
    },
    sources: {},
    ignores: ['\\.', '-'],
    locales: [],
    defaultLocale: undefined,
    highlight: false,
    markdown: {
      tags: Object.fromEntries(PROSE_TAGS.map(t => [t, `prose-${t}`]))
    },
    yaml: {},
    csv: {},
    navigation: {
      fields: []
    },
    documentDriven: false
  },
  async setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve('./runtime') })
    const contentContext: ContentContext = {
      transformers: [
        // Register internal content plugins
        resolveRuntimeModule('./server/transformers/markdown'),
        resolveRuntimeModule('./server/transformers/yaml'),
        resolveRuntimeModule('./server/transformers/json'),
        resolveRuntimeModule('./server/transformers/csv'),
        resolveRuntimeModule('./server/transformers/path-meta')
      ],
      ...options
    }

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

    // Add Content plugin
    addPlugin(resolveRuntimeModule('./plugins/ws'))

    nuxt.hook('nitro:config', (nitroConfig) => {
      // Init Nitro context
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
      nitroConfig.handlers = nitroConfig.handlers || []

      // Add server handlers
      nitroConfig.handlers.push(
        {
          method: 'get',
          route: `/api/${options.base}/query/:qid`,
          handler: resolveRuntimeModule('./server/api/query')
        },
        {
          method: 'get',
          route: `/api/${options.base}/query`,
          handler: resolveRuntimeModule('./server/api/query')
        },
        {
          method: 'get',
          route: `/api/${options.base}/cache`,
          handler: resolveRuntimeModule('./server/api/cache')
        }
      )

      if (!nuxt.options.dev) {
        nitroConfig.prerender.routes.push('/api/_content/cache')
      }

      // Register source storages
      const sources = useContentMounts(nuxt, contentContext.sources)
      nitroConfig.devStorage = Object.assign(nitroConfig.devStorage || {}, sources)

      // Tell Nuxt to ignore content dir for app build
      for (const source of Object.values(sources)) {
        // Only targets directories inside the srcDir
        if (source.driver === 'fs' && source.base.includes(nuxt.options.srcDir)) {
          nuxt.options.ignore.push(
            // Remove `srcDir` from the path
            join(source.base, '**/*').replace(withTrailingSlash(nuxt.options.srcDir), '')
          )
        }
      }

      nitroConfig.bundledStorage = nitroConfig.bundledStorage || []
      nitroConfig.bundledStorage.push('/cache/content')

      // @ts-ignore
      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [
          // Inline module runtime in Nitro bundle
          resolve('./runtime')
        ]
      })

      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#content/server'] = resolveRuntimeModule('./server')

      nitroConfig.virtual = nitroConfig.virtual || {}
      nitroConfig.virtual['#content/virtual/transformers'] = [
        // TODO: remove kit usage
        templateUtils.importSources(contentContext.transformers),
        `const transformers = [${contentContext.transformers.map(templateUtils.importName).join(', ')}]`,
        'export const getParser = (ext) => transformers.find(p => ext.match(new RegExp(p.extensions.join("|"),  "i")) && p.parse)',
        'export const getTransformers = (ext) => transformers.filter(p => ext.match(new RegExp(p.extensions.join("|"),  "i")) && p.transform)',
        'export default () => {}'
      ].join('\n')
    })

    // Register composables
    addAutoImport([
      { name: 'queryContent', as: 'queryContent', from: resolveRuntimeModule('./composables/query') },
      { name: 'useContentHelpers', as: 'useContentHelpers', from: resolveRuntimeModule('./composables/helpers') },
      { name: 'useContentHead', as: 'useContentHead', from: resolveRuntimeModule('./composables/head') },
      { name: 'withContentBase', as: 'withContentBase', from: resolveRuntimeModule('./composables/utils') },
      { name: 'useUnwrap', as: 'useUnwrap', from: resolveRuntimeModule('./composables/utils') }
    ])

    // Register components
    await addComponentsDir({
      path: resolve('./runtime/components'),
      pathPrefix: false,
      prefix: '',
      level: 999,
      global: true
    })

    addTemplate({
      filename: 'types/content.d.ts',
      getContents: () => [
        'declare module \'#content/server\' {',
        `  const serverQueryContent: typeof import('${resolve('./runtime/server')}').serverQueryContent`,
        `  const parseContent: typeof import('${resolve('./runtime/server')}').parseContent`,
        '}'
      ].join('\n')
    })

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolve(nuxt.options.buildDir, 'types/content.d.ts') })
    })

    // Register user global components
    const globalComponents = resolve(nuxt.options.srcDir, 'components/content')
    const dirStat = await fs.promises.stat(globalComponents).catch(() => null)
    if (dirStat && dirStat.isDirectory()) {
      logger.success('Using `~/components/content` for components in Markdown')
      nuxt.hook('components:dirs', (dirs) => {
        // Unshift to make it before ~/components
        dirs.unshift({
          path: globalComponents,
          global: true,
          pathPrefix: false,
          prefix: ''
        })
      })
    } else {
      const componentsDir = resolve(nuxt.options.srcDir, 'components/')
      const componentsDirStat = await fs.promises.stat(componentsDir).catch(() => null)

      if (componentsDirStat && componentsDirStat.isDirectory()) {
        // TODO: watch for file creation and tell Nuxt to restart
        // Not possible for now since directories are hard-coded: https://github.com/nuxt/framework/blob/5b63ae8ad54eeb3cb49479da8f32eacc1a743ca0/packages/nuxi/src/commands/dev.ts#L94
        logger.info('Please create `~/components/content` and restart the Nuxt server to use components in Markdown')
      }
    }

    // Register navigation
    if (options.navigation) {
      addAutoImport({ name: 'fetchContentNavigation', as: 'fetchContentNavigation', from: resolveRuntimeModule('./composables/navigation') })

      nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.handlers = nitroConfig.handlers || []
        nitroConfig.handlers.push({
          method: 'get',
          route: `/api/${options.base}/navigation/:qid`,
          handler: resolveRuntimeModule('./server/api/navigation')
        })
        nitroConfig.handlers.push({
          method: 'get',
          route: `/api/${options.base}/navigation`,
          handler: resolveRuntimeModule('./server/api/navigation')
        })
      })
    }

    // Register highlighter
    if (options.highlight) {
      contentContext.transformers.push(resolveRuntimeModule('./server/transformers/shiki'))

      nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.handlers = nitroConfig.handlers || []
        nitroConfig.handlers.push({
          method: 'post',
          route: `/api/${options.base}/highlight`,
          handler: resolveRuntimeModule('./server/api/highlight')
        })
      })
    }

    // Register document-driven
    if (options.documentDriven) {
      // Enable every feature by default
      const defaultDocumentDrivenConfig = {
        page: true,
        navigation: true,
        surround: true,
        globals: {},
        layoutFallbacks: ['theme'],
        injectPage: true
      }

      // If set to true, use defaults else merge defaults with user config
      if (options.documentDriven === true) {
        options.documentDriven = defaultDocumentDrivenConfig
      } else {
        options.documentDriven = {
          ...defaultDocumentDrivenConfig,
          ...options.documentDriven
        }
      }

      // Support layout field by default
      if (options.navigation) {
        options.navigation.fields.push('layout')
      }

      addAutoImport([
        { name: 'useContentState', as: 'useContentState', from: resolveRuntimeModule('./composables/content') },
        { name: 'useContent', as: 'useContent', from: resolveRuntimeModule('./composables/content') }
      ])

      addPlugin(resolveRuntimeModule('./plugins/documentDriven'))

      if (options.documentDriven.injectPage) {
        nuxt.options.pages = true

        nuxt.hook('pages:extend', (pages) => {
          // Respect user's custom catch-all page
          if (!pages.find(page => page.path === '/:slug(.*)*')) {
            pages.unshift({
              name: 'slug',
              path: '/:slug(.*)*',
              file: resolveRuntimeModule('./pages/document-driven.vue'),
              children: []
            })
          }
        })
        nuxt.hook('app:resolve', async (app) => {
          if (app.mainComponent?.includes('@nuxt/ui-templates')) {
            app.mainComponent = resolveRuntimeModule('./app.vue')
          } else {
            const appContent = await fs.promises.readFile(app.mainComponent!, { encoding: 'utf-8' })
            if (appContent.includes('<NuxtLayout') || appContent.includes('<nuxt-layout')) {
              logger.warn([
                'Using `<NuxtLayout>` inside `app.vue` will cause unwanted layout shifting in your application.',
                'Consider removing `<NuxtLayout>` from `app.vue` and using it in your pages.'
              ].join(''))
            }
          }
        })
      }
    } else {
      // Noop useContent
      addAutoImport([
        { name: 'useContentDisabled', as: 'useContentState', from: resolveRuntimeModule('./composables/utils') },
        { name: 'useContentDisabled', as: 'useContent', from: resolveRuntimeModule('./composables/utils') }
      ])
    }

    // @ts-ignore
    await nuxt.callHook('content:context', contentContext)

    contentContext.defaultLocale = contentContext.defaultLocale || contentContext.locales[0]

    // Generate cache integerity based on content context
    const cacheIntegrity = hash({
      locales: options.locales,
      options: options.defaultLocale,
      markdown: options.markdown,
      hightlight: options.highlight
    })

    // Process markdown plugins, resovle paths
    contentContext.markdown = processMarkdownOptions(contentContext.markdown)

    nuxt.options.runtimeConfig.public.content = defu(nuxt.options.runtimeConfig.public.content, {
      base: options.base,
      // Tags will use in markdown renderer for component replacement
      tags: contentContext.markdown.tags as any,
      highlight: options.highlight as any,
      wsUrl: '',
      // Document-driven configuration
      documentDriven: options.documentDriven as ModuleOptions['documentDriven']
    })

    // Context will use in server
    nuxt.options.runtimeConfig.content = {
      cacheVersion: CACHE_VERSION,
      cacheIntegrity,
      ...contentContext as any
    }

    // Setup content dev module
    if (!nuxt.options.dev) { return }

    nuxt.hook('nitro:init', async (nitro) => {
      if (!options.watch || !options.watch.ws) { return }

      const ws = createWebSocket()

      // Dispose storage on nuxt close
      nitro.hooks.hook('close', async () => {
        await ws.close()
      })

      // Listen dev server
      const { server, url } = await listen(() => 'Nuxt Content', options.watch.ws)

      server.on('upgrade', ws.serve)

      // Register ws url
      nitro.options.runtimeConfig.public.content.wsUrl = url.replace('http', 'ws')

      // Watch contents
      await nitro.storage.watch((event: WatchEvent, key: string) => {
        // Ignore events that are not related to content
        if (!key.startsWith(MOUNT_PREFIX)) {
          return
        }
        key = key.substring(MOUNT_PREFIX.length)
        // Broadcast a message to the server to refresh the page
        ws.broadcast({ event, key })
      })
    })
  }
})

interface ModulePublicRuntimeConfig {
  tags: Record<string, string>

  base: string;

  // Websocket server URL
  wsUrl?: string;

  // Shiki config
  highlight: ModuleOptions['highlight']
}

interface ModulePrivateRuntimeConfig {
  /**
   * Internal version that represents cache format.
   * This is used to invalidate cache when the format changes.
   */
  cacheVersion: string;
  cacheIntegrity: string;
}

declare module '@nuxt/schema' {
  interface ConfigSchema {
    runtimeConfig: {
      public?: {
        content?: ModulePublicRuntimeConfig;
      }
      private?: {
        content?: ModulePrivateRuntimeConfig & ContentContext;
      }
    }
  }
}
