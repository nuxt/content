import fs from 'fs'
import {
  addComponentsDir,
  addImports,
  addPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
  extendViteConfig,
  installModule,
  addVitePlugin,
  addServerPlugin
} from '@nuxt/kit'
import type { Component } from '@nuxt/schema'
import { defu } from 'defu'
import { genDynamicImport, genImport, genSafeVariableName } from 'knitwork'
import { listen } from 'listhen'
import { hash } from 'ohash'
import { join, relative } from 'pathe'
import { joinURL, withLeadingSlash, withTrailingSlash } from 'ufo'
import { createStorage, type WatchEvent } from 'unstorage'
import { name, version } from '../package.json'
import type { ParsedContent } from './types/content'
import { makeIgnored } from './runtime/utils/config'
import {
  CACHE_VERSION,
  MOUNT_PREFIX,
  PROSE_TAGS,
  createWebSocket,
  getMountDriver,
  logger,
  processMarkdownOptions,
  useContentMounts
} from './utils'
import type { ContentContext, ModuleOptions } from './types/module'

export * from './types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'content',
    compatibility: {
      nuxt: '>=3.0.0-rc.3'
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
      cacheContents: true,
      stripQueryParameters: false,
      advanceQuery: false,
      search: undefined
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

      if (options.experimental?.search) {
        const route = nuxt.options.dev
          ? `${options.api.baseURL}/search`
          : `${options.api.baseURL}/search-${buildIntegrity}`

        nitroConfig.handlers.push({
          method: 'get',
          route,
          handler: resolveRuntimeModule('./server/api/search')
        })

        nitroConfig.routeRules = nitroConfig.routeRules || {}
        nitroConfig.routeRules[route] = {
          prerender: true,
          // Use text/plain to avoid Nitro render an index.html
          headers: options.experimental.search.indexed ? { 'Content-Type': 'text/plain; charset=utf-8' } : { 'Content-Type': 'application/json' }
        }
      }

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

    if (options.experimental?.search) {
      const defaultSearchOptions: Partial<ModuleOptions['experimental']['search']> = {
        indexed: true,
        ignoredTags: ['script', 'style', 'pre'],
        filterQuery: { _draft: false, _partial: false },
        options: {
          fields: ['title', 'content', 'titles'],
          storeFields: ['title', 'content', 'titles'],
          searchOptions: {
            prefix: true,
            fuzzy: 0.2,
            boost: {
              title: 4,
              content: 2,
              titles: 1
            }
          }
        }
      }

      options.experimental.search = {
        ...defaultSearchOptions,
        ...options.experimental.search
      }

      nuxt.options.modules.push('@vueuse/nuxt')

      addImports([
        {
          name: 'defineMiniSearchOptions',
          as: 'defineMiniSearchOptions',
          from: resolveRuntimeModule('./composables/search')
        },
        {
          name: 'searchContent',
          as: 'searchContent',
          from: resolveRuntimeModule('./composables/search')
        }
      ])
    }

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
        const components = options.getComponents().filter((c: any) => !c.island).flatMap((c: any) => {
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

    // Enable hot reload for dev server
    if (nuxt.options.dev) {
      addServerPlugin(resolveRuntimeModule("./server/plugins/refresh-cache"));
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
              ].join(' '))
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

    await nuxt.callHook('content:context' as any, contentContext)

    contentContext.defaultLocale = contentContext.defaultLocale || contentContext.locales[0]

    // Generate cache integrity based on content context
    const cacheIntegrity = hash({
      locales: options.locales,
      options: options.defaultLocale,
      markdown: options.markdown,
      hightlight: options.highlight
    })

    // Process markdown plugins, resolve paths
    contentContext.markdown = processMarkdownOptions(contentContext.markdown)

    // Disable MDC plugin if user disabled it
    if (options.markdown?.mdc === false) {
      (contentContext.markdown.remarkPlugins as Record<string, any>)['remark-mdc'] = undefined
    }

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

    await installModule('@nuxtjs/mdc', nuxtMDCOptions as any)

    // Update mdc optimizeDeps options
    extendViteConfig((config) => {
      config.optimizeDeps ||= {}
      config.optimizeDeps.include ||= []
      config.optimizeDeps.include.push('@nuxt/content > slugify')
      config.optimizeDeps.include = config.optimizeDeps.include
        .map(id => id.replace(/^@nuxtjs\/mdc > /, '@nuxt/content > @nuxtjs/mdc > '))
     
      config.plugins?.push({
        name: 'content-slot',
        enforce: 'pre',
        transform (code) {
          if (code.includes('ContentSlot')) {
            code = code.replace(/<ContentSlot(\s)+([^/>]*)(:use=['"](\$slots.)?([a-zA-Z0-9_-]*)['"])/g, '<MDCSlot$1$2name="$5"')
            code = code.replace(/<\/ContentSlot>/g, '</MDCSlot>')
            code = code.replace(/<ContentSlot/g, '<MDCSlot')
            code = code.replace(/(['"])ContentSlot['"]/g, '$1MDCSlot$1')
            code = code.replace(/ContentSlot\(([^(]*)(:use=['"](\$slots.)?([a-zA-Z0-9_-]*)['"]|use=['"]([a-zA-Z0-9_-]*)['"])([^)]*)/g, 'MDCSlot($1name="$4"$6')
            return {
              code,
              map: { mappings: '' }
            }
          }
          if (code.includes('content-slot')) {
            code = code.replace(/<content-slot(\s)+([^/>]*)(:use=['"](\$slots.)?([a-zA-Z0-9_-]*)['"])/g, '<MDCSlot$1$2name="$5"')
            code = code.replace(/<\/content-slot>/g, '</MDCSlot>')
            code = code.replace(/<content-slot/g, '<MDCSlot')
            code = code.replace(/(['"])content-slot['"]/g, '$1MDCSlot$1')
            code = code.replace(/content-slot\(([^(]*)(:use=['"](\$slots.)?([a-zA-Z0-9_-]*)['"]|use=['"]([a-zA-Z0-9_-]*)['"])([^)]*)/g, 'MDCSlot($1name="$4"$6')
            return {
              code,
              map: { mappings: '' }
            }
          }
        }
      })
    })

    const contentRuntime = defu(nuxt.options.runtimeConfig.public.content, {
      locales: options.locales,
      defaultLocale: contentContext.defaultLocale || undefined,
      integrity: buildIntegrity as number,
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
      search: options.experimental.search as any,
      contentHead: options.contentHead ?? true,
      // Anchor link generation config
      // @deprecated
      anchorLinks: options.markdown.anchorLinks as { depth?: number, exclude?: number[] }
    })
    // @ts-expect-error - TODO: remove this
    nuxt.options.runtimeConfig.public.content = contentRuntime

    // Context will use in server
    nuxt.options.runtimeConfig.content = defu(nuxt.options.runtimeConfig.content as any, {
      cacheVersion: CACHE_VERSION,
      cacheIntegrity,
      ...contentContext as any
    })

    // @nuxtjs/tailwindcss support
    // @ts-expect-error - Module might not exist
    nuxt.hook('tailwindcss:config', async (tailwindConfig) => {
      const contentPath = resolve(nuxt.options.buildDir, 'content-cache', 'parsed/**/*.{md,yml,yaml,json}')
      tailwindConfig.content = tailwindConfig.content ?? []

      if (Array.isArray(tailwindConfig.content)) {
        tailwindConfig.content.push(contentPath)
      } else {
        tailwindConfig.content.files = tailwindConfig.content.files ?? []
        tailwindConfig.content.files.push(contentPath)
      }

      // @ts-expect-error
      const [tailwindCssPath] = Array.isArray(nuxt.options.tailwindcss?.cssPath) ? nuxt.options.tailwindcss.cssPath : [nuxt.options.tailwindcss?.cssPath]
      let cssPath = tailwindCssPath ? await resolvePath(tailwindCssPath, { extensions: ['.css', '.sass', '.scss', '.less', '.styl'] }) : join(nuxt.options.dir.assets, 'css/tailwind.css')
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

export interface ModuleHooks {
  'content:context'(ctx: ContentContext): void
}

interface ModulePublicRuntimeConfig {
  experimental: {
    stripQueryParameters: boolean
    clientDB: boolean
    advanceQuery: boolean
  }

  api: {
    baseURL: string
  }

  host: string | undefined

  trailingSlash: boolean

  integrity: number | undefined

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

  search: ModuleOptions['experimental']['search']

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

// Keep sync with src/runtime/server/storage.ts
declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'content:file:beforeParse': (file: { _id: string; body: string }) => void;
    'content:file:afterParse': (file: ParsedContent) => void;
  }
}
