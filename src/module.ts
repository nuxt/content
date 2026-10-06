import { comarkContent, contentHub, generateSourceTypes, readArtifact } from 'comark-content'
import defu from 'defu'
import type { CacheArtifact, Manifest, AnyComarkContent, ContentHub } from 'comark-content'
import { defineNuxtModule, createResolver, addServerImports, addServerHandler, addImports, addComponent, addPrerenderRoutes, addDevServerHandler, addTypeTemplate } from '@nuxt/kit'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { toWebRequest, serveStatic } from 'h3'
import type { Nuxt } from 'nuxt/schema'
import type { MediaMethods } from 'comark-content/plugins/media'
import { importContent } from './utils/config'
import { importMetaTypesTemplate } from './utils/templates'
import { v3ServerPlugins } from './runtime/v3/content-plugins.server'
import { fileURLToPath } from 'node:url'

// `ContentHub<any>`: a hub over a mutable instance array isn't assignable to the
// default `ContentHub<readonly AnyComarkContent[]>` (its `query` is invariant in T).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContentSurface = AnyComarkContent | ContentHub<any>
type ContentWithMedia = ContentSurface & Partial<MediaMethods>

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
    // Server handlers are written against `nuxt/server`.
    compatibility: { nuxt: '>=4.6.0' },
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

    const contentPath = existsSync(resolve(nuxt.options.serverDir, 'content.ts'))
      ? resolve(nuxt.options.serverDir, 'content')
      : existsSync(resolve(nuxt.options.rootDir, 'content.config.ts'))
        ? resolve('./runtime/server/internal/content-config')
        : resolve('./runtime/server/internal/fallback-content')

    nuxt.options.vite.optimizeDeps = defu(nuxt.options.vite.optimizeDeps, {
      include: ['@nuxt/content > comark-content > slugify'],
      exclude: ['@sqlite.org/sqlite-wasm'],
    })

    nuxt.options.nitro.replace = defu(nuxt.options.nitro.replace, {
      'import.meta.rootDir': JSON.stringify(nuxt.options.rootDir),
      'import.meta.content.v3Compatibility': JSON.stringify(options.v3Composables ?? true),
    })

    nuxt.options.vite.define = defu(nuxt.options.vite.define, {
      'import.meta.content.v3Compatibility': JSON.stringify(options.v3Composables ?? true),
    })

    const content = await setupContent(contentPath, nuxt, options)

    addServerImports({ name: 'content', from: contentPath })
    addServerHandler({ route: '/__nuxt_content/**', handler: { nuxt: resolve('./runtime/server/internal/api' + (nuxt.options.dev ? '.dev' : '')) } })

    addImports({ name: 'content', from: resolve(`./runtime/client-content/${options.mode === 'hybrid' ? 'hybrid' : 'server-only'}`) })
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
    setupTypes(content, nuxt)

    /**
     * The following operation are for runtime and don't need to execute them in prepare mode
     */
    if (nuxt.options._prepare) return

    /**
     * Register middleware for dev and prerender to serve medias
     */
    if (content && 'media' in content && content.media) setupMedia(content as ContentWithMedia & MediaMethods, nuxt)
  },
})

async function setupTypes(content: ContentSurface | undefined, nuxt: Nuxt) {
  const importMetaTypes = addTypeTemplate({ filename: 'content/import-meta.d.ts', getContents: importMetaTypesTemplate })

  const nitroTypeIncludes = [
    importMetaTypes.dst,
  ]

  nuxt.options.typescript = defu(nuxt.options.typescript, {
    tsConfig: { include: [importMetaTypes.dst] },
  })

  // Generate types
  if (content) {
    // TODO: Double check and possibly disable on build to prevent duplicate source loading
    nitroTypeIncludes.push(
      addTypeTemplate({
        filename: 'content/types.d.ts',
        getContents: async () => {
          try {
            return await generateSourceTypes(content)
          }
          catch {
            // console.warn('[nuxt/content] generateSourceTypes failed:', error)
            return '// generateSourceTypes failed\nexport {}\n'
          }
        },
      }).dst,
    )
  }

  nuxt.options.nitro.typescript = defu(nuxt.options.nitro.typescript, {
    tsConfig: { include: nitroTypeIncludes },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isHub(surface: ContentSurface): surface is ContentHub<any> {
  return Array.isArray((surface as ContentHub).names)
}

function resolveInstanceNames(surface: ContentSurface): string[] {
  if (isHub(surface)) {
    return [...surface.names]
  }
  return [surface.name]
}

async function cloneSurface(
  surface: ContentSurface,
  overrides: { basePath?: string, plugins?: NonNullable<AnyComarkContent['options']['plugins']> },
): Promise<ContentSurface> {
  // Shared extra plugins (one SQLite) across every instance on a hub.
  const extraPlugins = overrides.plugins ?? []

  if (isHub(surface)) {
    const instances = surface.names.map((name) => {
      const instance = surface.from(name)
      return comarkContent(instance.name, {
        ...instance.options,
        // Fresh in-memory cache for the module/dev surface.
        cache: undefined,
        basePath: overrides.basePath ?? instance.options.basePath,
        plugins: [
          ...(instance.options.plugins ?? []),
          ...extraPlugins,
        ],
      })
    })
    return contentHub(instances, { basePath: overrides.basePath ?? surface.basePath })
  }

  return comarkContent(surface.name, {
    ...surface.options,
    cache: undefined,
    basePath: overrides.basePath ?? surface.options.basePath,
    plugins: [
      ...(surface.options.plugins ?? []),
      ...extraPlugins,
    ],
  })
}

async function setupContent(contentPath: string, nuxt: Nuxt, options: ModuleOptions): Promise<ContentSurface | undefined> {
  const { resolve } = createResolver(import.meta.url)

  const imported = await importContent(nuxt.options.rootDir, contentPath)
  // Dev server gets its own surface so plugins / basePath can differ without
  // mutating the user-exported instance that Nitro will import later.
  // Skip re-injecting v3 plugins when the export already went through
  // createNuxtContent() (it installs them once with a shared database).
  const alreadyHasV3 = Boolean(imported.content && 'query' in imported.content)
  const content = await cloneSurface(imported.content, {
    basePath: '/__NCDEV__/__nuxt_content',
    plugins: alreadyHasV3 ? [] : v3ServerPlugins(options.v3Composables ?? true),
  })

  const sourceNames = resolveInstanceNames(content)

  addPrerenderRoutes([
    '/__nuxt_content/manifest.json',
    ...sourceNames.map(source => `/__nuxt_content/manifest/${source}.json`),
    ...sourceNames.map(source => `/__nuxt_content/snapshot/${source}.json`),
  ])

  /**
   * In server-only mode we don't keep snapshot in public assets
   */
  if (options.mode === 'server-only') {
    nuxt.hook('nitro:init', async (nitro) => {
      const dir = resolve(nuxt.options.buildDir, 'content/prerender')
      nitro.options.serverAssets.push({ baseName: 'content', dir })
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
        if (route.route.startsWith('/__nuxt_content/manifest/')) {
          // Per-instance manifest, stored next to its snapshot for the withSnapshot loaders.
          const name = route.route.split('/').pop()!.replace(/\.json$/, '')
          await mkdir(resolve(dir, name), { recursive: true })
          await writeFile(resolve(dir, name, 'manifest.json'), route.contents!)
        }
        if (route.route.startsWith('/__nuxt_content/snapshot/')) {
          const file = route.route.split('/').pop()! // e.g. content.json
          const name = file.replace(/\.json$/, '')
          await mkdir(resolve(dir, name), { recursive: true })
          await writeFile(resolve(dir, name, 'snapshot.json'), route.contents!)
          await writeFile(resolve(dir, file), route.contents!)
        }
      })
    })
  }

  if (nuxt.options.dev) {
    if (content) {
      // Dev handlers are mounted on the dev server as-is (no `nuxt/server` adapter), so they use h3 v1 directly.
      addDevServerHandler({ route: '/__NCDEV__/', handler: { nitro2: ev => content.handler(toWebRequest(ev)) } })

      if (options.watch) {
        const unwatch = await content.watch()
        nuxt.hook('close', unwatch)
      }
    }
  }

  return content
}

function setupMedia(content: ContentWithMedia & MediaMethods, nuxt: Nuxt) {
  const { resolve } = createResolver(import.meta.url)
  /**
   * Register middleware to serve content media files
   */
  if (nuxt.options.dev) {
    addDevServerHandler({
      route: '/',
      handler: {
        nitro2: (event) => {
          const info = content.stat(event.path.replace('/media', ''))
          if (info?.meta.kind === 'media') {
            return serveStatic(event, {
              getContents: async () => content.media.get(info.meta.key),
              getMeta: () => ({
                type: info.meta.type,
              }),
            })
          }
        },
      },
    })
  }
  else {
    addServerHandler({
      handler: { nuxt: resolve('./runtime/server/internal/assets-middleware') },
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
