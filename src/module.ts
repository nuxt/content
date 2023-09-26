import fs from 'fs'
import {
  addPlugin,
  defineNuxtModule,
  createResolver,
  addImports,
  addComponentsDir,
  addTemplate,
  extendViteConfig,
  installModule,
  addVitePlugin
} from '@nuxt/kit'
import { genDynamicImport, genImport, genSafeVariableName } from 'knitwork'
import type { ListenOptions } from 'listhen'
// eslint-disable-next-line import/no-named-as-default
import defu from 'defu'
import { hash } from 'ohash'
import { join, relative } from 'pathe'
import type { Lang as ShikiLang, Theme as ShikiTheme } from 'shiki-es'
import { listen } from 'listhen'
import { type WatchEvent, createStorage } from 'unstorage'
import { joinURL, withLeadingSlash, withTrailingSlash } from 'ufo'
import type { Component } from '@nuxt/schema'
import { name, version } from '../package.json'
import { makeIgnored } from './runtime/utils/config'
import {
  CACHE_VERSION,
  createWebSocket,
  getMountDriver,
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
   * @deprecated Use `api.base` instead
   */
  base: string
  api: {
    /**
     * Base route that will be used for content api
     *
     * @default '/api/_content'
     */
    baseURL: string
  }
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
   * Contents can be located in multiple places, in multiple directories or even in remote git repositories.
   * Using sources option you can tell Content module where to look for contents.
   *
   * @default ['content']
   */
  sources: Record<string, MountOptions> | Array<string | MountOptions>
  /**
   * List of ignore patterns that will be used to exclude content from parsing, rendering and watching.
   *
   * Note that files with a leading . or - are ignored by default
   *
   * @default []
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
    rehypePlugins?: Array<string | [string, MarkdownPlugin]> | Record<string, false | MarkdownPlugin>,
    /**
     * Anchor link generation config
     *
     * @default {}
     */
    anchorLinks?: boolean | {
      /**
        * Sets the maximal depth for anchor link generation
        *
        * @default 4
        */
      depth?: number,
      /**
       * Excludes headings from link generation when they are in the depth range.
       *
       * @default [1]
       */
      exclude?: number[]
    }
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
  csv: false | {
    json?: boolean
    delimeter?: string
  }
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
   * Enable automatic usage of `useContentHead`
   *
   * @default true
   */
  contentHead?: boolean
  /**
   * Document-driven mode config
   *
   * @default false
   */
  documentDriven: boolean | {
    host?: string
    page?: boolean
    navigation?: boolean
    surround?: boolean
    globals?: {
      [key: string]: QueryBuilderParams
    }
    layoutFallbacks?: string[]
    injectPage?: boolean
    trailingSlash?: boolean
  },
  /**
   * Enable to keep uppercase characters in the generated routes.
   *
   * @default false
   */
  respectPathCase: boolean
  experimental: {
    clientDB: boolean
    stripQueryParameters: boolean
    advanceQuery: boolean
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
    // @deprecated
    base: '',
    api: {
      baseURL: '/api/_content'
    },
    watch: {
      ws: {
        port: {
          port: 4000,
          portRange: [4000, 4040]
        },
        hostname: 'localhost',
        showURL: false
      }
    },
    sources: {},
    ignores: [],
    locales: [],
    defaultLocale: undefined,
    highlight: false,
    markdown: {
      tags: {
        ...Object.fromEntries(PROSE_TAGS.map(t => [t, `prose-${t}`])),
        code: 'ProseCodeInline'
      },
      anchorLinks: {
        depth: 4,
        exclude: [1]
      }
    },
    yaml: {},
    csv: {
      delimeter: ',',
      json: true
    },
    navigation: {
      fields: []
    },
    contentHead: true,
    documentDriven: false,
    respectPathCase: false,
    experimental: {
      clientDB: false,
      stripQueryParameters: false,
      advanceQuery: false
    }
  },
  async setup (options, nuxt) {
    const { resolve, resolvePath } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolve('./runtime', path)
    // Ensure default locale alway is the first item of locales
    options.locales = Array.from(new Set([options.defaultLocale, ...options.locales].filter(Boolean))) as string[]

    // Disable cache in dev mode
    const buildIntegrity = nuxt.options.dev ? undefined : Date.now()

    if (options.base) {
      logger.warn('content.base is deprecated. Use content.api.baseURL instead.')
      options.api.baseURL = withLeadingSlash(joinURL('api', options.base))
    }

    const contentContext: ContentContext = {
      transformers: [],
      ...options
    }

    // Add Vite configurations
    extendViteConfig((config) => {
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push('slugify')

      config.plugins?.push({
        name: 'content-slot',
        enforce: 'pre',
        transform (code) {
          if (code.includes('ContentSlot')) {
            code = code.replace(/<ContentSlot (.*)(:use=['"](\$slots.)?([a-zA-Z0-9_-]*)['"]|use=['"]([a-zA-Z0-9_-]*)['"])/g, '<MDCSlot $1 name="$4"')
            code = code.replace(/<\/ContentSlot>/g, '</MDCSlot>')
            code = code.replace(/<ContentSlot/g, '<MDCSlot')
            code = code.replace(/(['"])ContentSlot['"]/g, '$1MDCSlot$1')
            code = code.replace(/ContentSlot\(([^(]*)(:use=['"](\$slots.)?([a-zA-Z0-9_-]*)['"]|use=['"]([a-zA-Z0-9_-]*)['"])([^)]*)/g, 'MDCSlot($1name="$4"$6')
            return {
              code,
              map: { mappings: '' }
            }
          }
        }
      })
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      // Init Nitro context
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
      nitroConfig.handlers = nitroConfig.handlers || []

      // Add server handlers
      nitroConfig.handlers.push(
        {
          method: 'get',
          route: `${options.api.baseURL}/query/:qid/**:params`,
          handler: resolveRuntimeModule('./server/api/query')
        },
        {
          method: 'get',
          route: `${options.api.baseURL}/query/:qid`,
          handler: resolveRuntimeModule('./server/api/query')
        },
        {
          method: 'get',
          route: `${options.api.baseURL}/query`,
          handler: resolveRuntimeModule('./server/api/query')
        },
        {
          method: 'get',
          route: nuxt.options.dev
            ? `${options.api.baseURL}/cache.json`
            : `${options.api.baseURL}/cache.${buildIntegrity}.json`,
          handler: resolveRuntimeModule('./server/api/cache')
        }
      )

      if (!nuxt.options.dev) {
        nitroConfig.prerender.routes.unshift(`${options.api.baseURL}/cache.${buildIntegrity}.json`)
      }

      // Register source storages
      const sources = useContentMounts(nuxt, contentContext.sources)
      nitroConfig.devStorage = Object.assign(nitroConfig.devStorage || {}, sources)
      nitroConfig.devStorage['cache:content'] = {
        driver: 'fs',
        base: resolve(nuxt.options.buildDir, 'content-cache')
      }

      // Tell Nuxt to ignore content dir for app build
      for (const source of Object.values(sources)) {
        // Only targets directories inside the srcDir
        if (source.driver === 'fs' && source.base.includes(nuxt.options.srcDir)) {
          const wildcard = join(source.base, '**/*').replace(withTrailingSlash(nuxt.options.srcDir), '')
          nuxt.options.ignore.push(
            // Remove `srcDir` from the path
            wildcard,
            `!${wildcard}.vue`
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
      nitroConfig.alias['#content/server'] = resolveRuntimeModule(options.experimental.advanceQuery ? './server' : './legacy/server')

      const transformers = contentContext.transformers.map((t) => {
        const name = genSafeVariableName(relative(nuxt.options.rootDir, t)).replace(/_(45|46|47)/g, '_') + '_' + hash(t)
        return { name, import: genImport(t, name) }
      })

      nitroConfig.virtual = nitroConfig.virtual || {}
      nitroConfig.virtual['#content/virtual/transformers'] = [
        ...transformers.map(t => t.import),
        `export const transformers = [${transformers.map(t => t.name).join(', ')}]`,
        'export const getParser = (ext) => transformers.find(p => ext.match(new RegExp(p.extensions.join("|"),  "i")) && p.parse)',
        'export const getTransformers = (ext) => transformers.filter(p => ext.match(new RegExp(p.extensions.join("|"),  "i")) && p.transform)',
        'export default () => {}'
      ].join('\n')
    })

    // Register composables
    addImports([
      { name: 'queryContent', as: 'queryContent', from: resolveRuntimeModule(`./${options.experimental.advanceQuery ? '' : 'legacy/'}composables/query`) },
      { name: 'useContentHelpers', as: 'useContentHelpers', from: resolveRuntimeModule('./composables/helpers') },
      { name: 'useContentHead', as: 'useContentHead', from: resolveRuntimeModule('./composables/head') },
      { name: 'useContentPreview', as: 'useContentPreview', from: resolveRuntimeModule('./composables/preview') },
      { name: 'withContentBase', as: 'withContentBase', from: resolveRuntimeModule('./composables/utils') },
      { name: 'useUnwrap', as: 'useUnwrap', from: resolveRuntimeModule('./composables/useUnwrap') }
    ])

    // Register components
    addComponentsDir({
      path: resolve('./runtime/components'),
      pathPrefix: false,
      prefix: '',
      global: true
    })

    const componentsContext = { components: [] as Component[] }
    nuxt.hook('components:extend', (newComponents) => {
      componentsContext.components = newComponents.filter((c) => {
        if (c.pascalName.startsWith('Prose') || c.pascalName === 'NuxtLink') {
          return true
        }

        if (
          c.filePath.includes('@nuxt/content/dist') ||
          c.filePath.includes('@nuxtjs/mdc/dist') ||
          c.filePath.includes('nuxt/dist/app') ||
          c.filePath.includes('NuxtWelcome')
        ) {
          return false
        }

        return true
      })
    })
    addTemplate({
      filename: 'content-components.mjs',
      getContents ({ options }) {
        const components = options.getComponents(options.mode).filter((c: any) => !c.island).flatMap((c: any) => {
          const exp = c.export === 'default' ? 'c.default || c' : `c['${c.export}']`
          const isClient = c.mode === 'client'
          const definitions: string[] = []

          definitions.push(`export const ${c.pascalName} = ${genDynamicImport(c.filePath)}.then(c => ${isClient ? `createClientOnly(${exp})` : exp})`)
          return definitions
        })
        return components.join('\n')
      },
      options: { getComponents: () => componentsContext.components }
    })

    const typesPath = addTemplate({
      filename: 'types/content.d.ts',
      getContents: () => [
        'declare module \'#content/server\' {',
        `  const serverQueryContent: typeof import('${resolve(options.experimental.advanceQuery ? './runtime/server' : './runtime/legacy/types')}').serverQueryContent`,
        `  const parseContent: typeof import('${resolve('./runtime/server')}').parseContent`,
        '}'
      ].join('\n')
    }).dst

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: typesPath })
    })

    // Register user global components
    const _layers = [...nuxt.options._layers].reverse()
    for (const layer of _layers) {
      const srcDir = layer.config.srcDir
      const globalComponents = resolve(srcDir, 'components/content')
      const dirStat = await fs.promises.stat(globalComponents).catch(() => null)
      if (dirStat && dirStat.isDirectory()) {
        nuxt.hook('components:dirs', (dirs) => {
          dirs.unshift({
            path: globalComponents,
            global: true,
            pathPrefix: false,
            prefix: ''
          })
        })
      }
    }

    // Register navigation
    if (options.navigation) {
      addImports({ name: 'fetchContentNavigation', as: 'fetchContentNavigation', from: resolveRuntimeModule(`./${options.experimental.advanceQuery ? '' : 'legacy/'}composables/navigation`) })

      nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.handlers = nitroConfig.handlers || []
        nitroConfig.handlers.push(
          {
            method: 'get',
            route: `${options.api.baseURL}/navigation/:qid/**:params`,
            handler: resolveRuntimeModule('./server/api/navigation')
          }, {
            method: 'get',
            route: `${options.api.baseURL}/navigation/:qid`,
            handler: resolveRuntimeModule('./server/api/navigation')
          },
          {
            method: 'get',
            route: `${options.api.baseURL}/navigation`,
            handler: resolveRuntimeModule('./server/api/navigation')
          }
        )
      })
    } else {
      addImports({ name: 'navigationDisabled', as: 'fetchContentNavigation', from: resolveRuntimeModule('./composables/utils') })
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

      addImports([
        { name: 'useContentState', as: 'useContentState', from: resolveRuntimeModule('./composables/content') },
        { name: 'useContent', as: 'useContent', from: resolveRuntimeModule('./composables/content') }
      ])

      addPlugin(resolveRuntimeModule(
        options.experimental.advanceQuery
          ? './plugins/documentDriven'
          : './legacy/plugins/documentDriven'
      ))

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
      addImports([
        { name: 'useContentDisabled', as: 'useContentState', from: resolveRuntimeModule('./composables/utils') },
        { name: 'useContentDisabled', as: 'useContent', from: resolveRuntimeModule('./composables/utils') }
      ])
    }

    // @ts-ignore
    await nuxt.callHook('content:context', contentContext)

    contentContext.defaultLocale = contentContext.defaultLocale || contentContext.locales[0]

    // Generate cache integrity based on content context
    const cacheIntegrity = hash({
      locales: options.locales,
      options: options.defaultLocale,
      markdown: options.markdown,
      hightlight: options.highlight
    })

    // Process markdown plugins, resovle paths
    contentContext.markdown = processMarkdownOptions(contentContext.markdown)

    const nuxtMDCOptions = {
      remarkPlugins: contentContext.markdown.remarkPlugins,
      rehypePlugins: contentContext.markdown.rehypePlugins,
      highlight: contentContext.highlight,
      components: {
        prose: true,
        map: contentContext.markdown.tags
      },
      headings: {
        anchorLinks: {
          // Reset defaults
          h2: false, h3: false, h4: false
        } as Record<string, boolean>
      }
    }

    // Apply anchor link generation config
    if (contentContext.markdown.anchorLinks) {
      for (let i = 0; i < (contentContext.markdown.anchorLinks as any).depth; i++) {
        nuxtMDCOptions.headings.anchorLinks[`h${i + 1}`] = !(contentContext.markdown.anchorLinks as any).exclude.includes(i + 1)
      }
    }

    await installModule('@nuxtjs/mdc', nuxtMDCOptions)

    nuxt.options.runtimeConfig.public.content = defu(nuxt.options.runtimeConfig.public.content, {
      locales: options.locales,
      defaultLocale: contentContext.defaultLocale,
      integrity: buildIntegrity,
      experimental: {
        stripQueryParameters: options.experimental.stripQueryParameters,
        advanceQuery: options.experimental.advanceQuery === true,
        clientDB: options.experimental.clientDB && nuxt.options.ssr === false
      },
      respectPathCase: options.respectPathCase ?? false,
      api: {
        baseURL: options.api.baseURL
      },
      navigation: contentContext.navigation as any,
      // Tags will use in markdown renderer for component replacement
      // @deprecated
      tags: contentContext.markdown.tags as any,
      // @deprecated
      highlight: options.highlight as any,
      wsUrl: '',
      // Document-driven configuration
      documentDriven: options.documentDriven as any,
      host: typeof options.documentDriven !== 'boolean' ? options.documentDriven?.host ?? '' : '',
      trailingSlash: typeof options.documentDriven !== 'boolean' ? options.documentDriven?.trailingSlash ?? false : false,
      contentHead: options.contentHead ?? true,
      // Anchor link generation config
      // @deprecated
      anchorLinks: options.markdown.anchorLinks as { depth?: number, exclude?: number[] }
    })

    // Context will use in server
    nuxt.options.runtimeConfig.content = defu(nuxt.options.runtimeConfig.content, {
      cacheVersion: CACHE_VERSION,
      cacheIntegrity,
      ...contentContext as any
    })

    // @nuxtjs/tailwindcss support
    // @ts-ignore - Module might not exist
    nuxt.hook('tailwindcss:config', async (tailwindConfig) => {
      const contentPath = resolve(nuxt.options.buildDir, 'content-cache', 'parsed/**/*.{md,yml,yaml,json}')
      tailwindConfig.content = tailwindConfig.content ?? []

      if (Array.isArray(tailwindConfig.content)) {
        tailwindConfig.content.push(contentPath)
      } else {
        tailwindConfig.content.files = tailwindConfig.content.files ?? []
        tailwindConfig.content.files.push(contentPath)
      }

      // @ts-ignore
      let cssPath = nuxt.options.tailwindcss?.cssPath ? await resolvePath(nuxt.options.tailwindcss?.cssPath, { extensions: ['.css', '.sass', '.scss', '.less', '.styl'] }) : join(nuxt.options.dir.assets, 'css/tailwind.css')
      if (!fs.existsSync(cssPath)) {
        cssPath = await resolvePath('tailwindcss/tailwind.css')
      }

      const contentSources = Object.values(useContentMounts(nuxt, contentContext.sources))
        .map(mount => mount.driver === 'fs' ? mount.base : undefined)
        .filter(Boolean)

      addVitePlugin({
        enforce: 'post',
        name: 'nuxt:content:tailwindcss',
        handleHotUpdate (ctx) {
          if (!contentSources.some(cs => ctx.file.startsWith(cs))) {
            return
          }

          const extraModules = ctx.server.moduleGraph.getModulesByFile(cssPath) || /* @__PURE__ */ new Set()
          const timestamp = +Date.now()
          for (const mod of extraModules) {
            ctx.server.moduleGraph.invalidateModule(mod, undefined, timestamp)
          }

          // Wait 100ms to make sure HMR is ready (content needs to be parsed first)
          // Without this, HMR will not work and user needs to save the file twice
          setTimeout(() => {
            ctx.server.ws.send({
              type: 'update',
              updates: Array.from(extraModules).map((mod) => {
                return {
                  type: mod.type === 'js' ? 'js-update' : 'css-update',
                  path: mod.url,
                  acceptedPath: mod.url,
                  timestamp
                }
              })
            })
          }, 100)
        }
      })
    })

    // ignore files
    const isIgnored = makeIgnored(contentContext.ignores)

    // Setup content dev module
    if (!nuxt.options.dev) {
      nuxt.hook('build:before', async () => {
        const storage = createStorage()
        const sources = useContentMounts(nuxt, contentContext.sources)
        sources['cache:content'] = {
          driver: 'fs',
          base: resolve(nuxt.options.buildDir, 'content-cache')
        }
        for (const [key, source] of Object.entries(sources)) {
          storage.mount(key, await getMountDriver(source))
        }
        let keys = await storage.getKeys('content:source')

        // Filter invalid characters & ignore patterns
        const invalidKeyCharacters = "'\"?#/".split('')
        keys = keys.filter((key) => {
          if (key.startsWith('preview:') || isIgnored(key)) {
            return false
          }
          if (invalidKeyCharacters.some(ik => key.includes(ik))) {
            return false
          }
          return true
        })
        await Promise.all(
          keys.map(async (key: string) => await storage.setItem(
            `cache:content:parsed:${key.substring(15)}`,
            await storage.getItem(key)
          ))
        )
      })
      return
    }
    // ~~ DEV ~~ //

    // Add Content plugin
    addPlugin(resolveRuntimeModule('./plugins/ws'))

    nuxt.hook('nitro:init', async (nitro) => {
      if (!options.watch || !options.watch.ws) { return }

      const ws = createWebSocket()

      // Listen dev server
      const { server, url } = await listen(() => 'Nuxt Content', options.watch.ws)

      // Dispose storage on nuxt close
      nitro.hooks.hook('close', async () => {
        await ws.close()
        await server.close()
      })

      server.on('upgrade', ws.serve)

      // Register ws url
      nitro.options.runtimeConfig.public.content.wsUrl = url.replace('http', 'ws')

      // Remove content Index to force fresh index when nitro start (after a pull or a change without started Nuxt)
      await nitro.storage.removeItem('cache:content:content-index.json')

      // Watch contents
      await nitro.storage.watch(async (event: WatchEvent, key: string) => {
        // Ignore events that are not related to content
        if (!key.startsWith(MOUNT_PREFIX) || isIgnored(key)) {
          return
        }
        key = key.substring(MOUNT_PREFIX.length)

        // Remove content Index
        await nitro.storage.removeItem('cache:content:content-index.json')

        // Broadcast a message to the server to refresh the page
        ws.broadcast({ event, key })
      })
    })
  }
})

interface ModulePublicRuntimeConfig {
  experimental: {
    stripQueryParameters: boolean
    clientDB: boolean
    advanceQuery: boolean
  }
  respectPathCase: boolean

  defaultLocale: ModuleOptions['defaultLocale']

  locales: ModuleOptions['locales']

  tags: Record<string, string>

  base: string;

  // Websocket server URL
  wsUrl?: string;

  // Shiki config
  highlight: ModuleOptions['highlight']

  navigation: ModuleOptions['navigation']

  contentHead: ModuleOptions['contentHead']

  documentDriven: ModuleOptions['documentDriven']
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
  interface PublicRuntimeConfig {
    content: ModulePublicRuntimeConfig;
  }
  interface PrivateRuntimeConfig {
    content: ModulePrivateRuntimeConfig & ContentContext;
  }
}
