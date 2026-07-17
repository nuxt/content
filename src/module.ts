import { createCMS, generateSourceTypes, readArtifact } from '@comark/cms'
import defu from 'defu'
import type { CacheArtifact, ComarkCMS, Manifest } from '@comark/cms'
import { defineNuxtModule, createResolver, addServerImports, addServerHandler, addImports, addComponent, addPrerenderRoutes, addDevServerHandler, addTypeTemplate } from '@nuxt/kit'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { toWebRequest, serveStatic } from 'h3'
import type { Nuxt } from 'nuxt/schema'
import type { MediaMethods } from '@comark/cms/plugins/media'
import { importCMS } from './utils/config'
import { importMetaTypesTemplate } from './utils/templates'
import { v3ServerPlugins } from './runtime/v3/cms-plugins.server'
import { fileURLToPath } from 'node:url'

// Module options TypeScript interface definition
export interface ModuleOptions {
  mode?: 'server-only' | 'hybrid'
  watch?: boolean
  v3Composables?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxt/content',
    configKey: 'content',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    watch: true,
    v3Composables: true,
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    options.mode = options.mode || process.env.CONTENT_MODE as ModuleOptions['mode']
    if (!['hybrid', 'server-only'].includes(options.mode!)) {
      options.mode = 'hybrid'
    }

    const cmsPath = existsSync(resolve(nuxt.options.serverDir, 'cms.ts'))
      ? resolve(nuxt.options.serverDir, 'cms')
      : resolve('./runtime/server/internal/fallback-cms')

    nuxt.options.vite.optimizeDeps = defu(nuxt.options.vite.optimizeDeps, {
      include: ['@nuxt/content > @comark/cms > slugify'],
      exclude: ['@sqlite.org/sqlite-wasm'],
    })

    nuxt.options.nitro.replace = defu(nuxt.options.nitro.replace, {
      'import.meta.rootDir': JSON.stringify(nuxt.options.rootDir),
      'import.meta.content.v3Compatibility': JSON.stringify(options.v3Composables ?? true),
    })

    nuxt.options.vite.define = defu(nuxt.options.vite.define, {
      'import.meta.content.v3Compatibility': JSON.stringify(options.v3Composables ?? true),
    })

    const cms = await setupCMS(cmsPath, nuxt, options)

    addServerImports({ name: 'cms', from: cmsPath })
    addServerHandler({ route: '/__nuxt_content/**', handler: resolve('./runtime/server/internal/api' + (nuxt.options.dev ? '.dev' : '')) })

    addImports({ name: 'cms', from: resolve(`./runtime/client-cms/${options.mode === 'hybrid' ? 'hybrid' : 'server-only'}`) })
    addComponent({ name: 'ContentRenderer', filePath: resolve('./runtime/components/ContentRenderer') })
    addComponent({ name: 'Comark', filePath: fileURLToPath(import.meta.resolve('@comark/vue')) })

    if (options.v3Composables) {
      addComponent({ name: 'MDC', filePath: resolve('./runtime/components/MDC') })
      addImports([
        { name: 'queryCollection', from: resolve('./runtime/v3/composables') },
        { name: 'queryCollectionNavigation', from: resolve('./runtime/v3/composables') },
        { name: 'queryCollectionItemSurroundings', from: resolve('./runtime/v3/composables') },
        { name: 'queryCollectionSearchSections', from: resolve('./runtime/v3/composables') },
        { name: 'useSearchCollection', from: resolve('./runtime/v3/composables') },
      ])
      addServerImports([
        { name: 'queryCollection', from: resolve('./runtime/v3/composables.server') },
        { name: 'queryCollectionNavigation', from: resolve('./runtime/v3/composables.server') },
        { name: 'queryCollectionItemSurroundings', from: resolve('./runtime/v3/composables.server') },
        { name: 'queryCollectionSearchSections', from: resolve('./runtime/v3/composables.server') },
      ])
    }

    /**
     * Add types templates
     */
    setupTypes(cms, nuxt)

    /**
     * The following operation are for runtime and don't need to execute them in prepare mode
     */
    if (nuxt.options._prepare) return

    /**
     * Register middleware for dev and prerender to serve medias
     */
    if (cms?.media) setupMedia(cms, nuxt)
  },
})

async function setupTypes(cms: ComarkCMS | undefined, nuxt: Nuxt) {
  const importMetaTypes = addTypeTemplate({ filename: 'comark-cms/import-meta.d.ts', getContents: importMetaTypesTemplate })

  const nitroTypeIncludes = [
    importMetaTypes.dst,
  ]

  nuxt.options.typescript = defu(nuxt.options.typescript, {
    tsConfig: { include: [importMetaTypes.dst] },
  })

  // Generate types
  if (cms) {
    // TODO: Double check and possibly disable on build to prevent duplicate source loading
    nitroTypeIncludes.push(
      addTypeTemplate({ filename: 'comark-cms/types.d.ts', getContents: () => generateSourceTypes(cms) }).dst,
    )
  }

  nuxt.options.nitro.typescript = defu(nuxt.options.nitro.typescript, {
    tsConfig: { include: nitroTypeIncludes },
  })
}

async function setupCMS(cmsPath: string, nuxt: Nuxt, options: ModuleOptions): Promise<ComarkCMS & MediaMethods | undefined> {
  const { resolve } = createResolver(import.meta.url)

  const cms = await importCMS(nuxt.options.rootDir, cmsPath)
    .then(m => createCMS({
      ...m.cms.options,
      basePath: '/__NCDEV__/__nuxt_content',
      cache: undefined,
      plugins: [
        ...(m.cms.options?.plugins ?? []),
        ...v3ServerPlugins(options.v3Composables ?? true),
      ],
    }))
  const sourceNames = cms?.options.source ? ['default'] : Object.keys(cms?.options.sources || [])

  addPrerenderRoutes([
    '/__nuxt_content/manifest.json',
    ...sourceNames.map(source => `/__nuxt_content/snapshot/${source}.json`),
  ])

  /**
   * In server-only mode we don't keep snapshot in public assets
   */
  if (options.mode === 'server-only') {
    nuxt.hook('nitro:init', async (nitro) => {
      const dir = resolve(nuxt.options.buildDir, 'comark-cms/prerender')
      nitro.options.serverAssets.push({ baseName: 'cms', dir })
      nitro.hooks.hook('prerender:generate', async (route) => {
        if (!route.route.startsWith('/__nuxt_content')) {
          /**
           * If route is not related to the Content module we don't need to do aything
           */
          return
        }
        /**
         * Skip the generation
         */
        route.skip = true

        await mkdir(dir, { recursive: true })
        if (route.route === '/__nuxt_content/manifest.json') {
          await writeFile(resolve(dir, 'manifest.json'), route.contents!)
        }
        if (route.route.startsWith('/__nuxt_content/snapshot/')) {
          await writeFile(resolve(dir, route.route.split('/').pop()!), route.contents!)
        }
      })
    })
  }

  if (nuxt.options.dev) {
    if (cms) {
      addDevServerHandler({ route: '/__NCDEV__/', handler: ev => cms.handler(toWebRequest(ev)) })

      if (options.watch) {
        const unwatch = await cms.watch()
        nuxt.hook('close', unwatch)
      }
    }
  }

  return cms as ComarkCMS & MediaMethods
}

function setupMedia(cms: ComarkCMS & MediaMethods, nuxt: Nuxt) {
  const { resolve } = createResolver(import.meta.url)
  /**
   * Register middleware to serve CMS media files
   */
  if (nuxt.options.dev) {
    addDevServerHandler({
      route: '/',
      handler: (event) => {
        const info = cms.stat(event.path.replace('/media', ''))
        if (info?.meta.kind === 'media') {
          return serveStatic(event, {
            getContents: async () => cms.media.get(info.meta.key),
            getMeta: () => ({
              type: info.meta.type,
            }),
          })
        }
      },
    })
  }
  else {
    addServerHandler({
      handler: resolve('./runtime/server/internal/assets-middleware'),
      middleware: true,
      env: ['dev', 'prerender', 'nitro-prerender'],
    })
  }

  /**
   * Add media routes to prerender routes
   */
  nuxt.hook('nitro:init', async (nitro) => {
    nitro.hooks.hook('prerender:routes', (routes) => {
      nitro.hooks.hook('prerender:generate', async (route) => {
        if (route.route === '/__nuxt_content/manifest.json') {
          const artifact = JSON.parse(route.contents!) as CacheArtifact
          const manifest = await readArtifact<Manifest>(artifact)

          const medias = Object.values(manifest.items).filter(item => item.meta.kind === 'media')
          for (const media of medias) {
            routes.add(media.path)
          }
        }
      })
    })
  })
}
