import { comarkContent, contentHub, generateSourceTypes, readArtifact } from 'comark-content'
import defu from 'defu'
import type { CacheArtifact, Manifest, AnyComarkContent, ContentHub, TypegenFieldContext } from 'comark-content'
import { defineNuxtModule, createResolver, addServerImports, addServerHandler, addImports, addComponent, addPlugin, addTemplate, addPrerenderRoutes, addDevServerHandler, addTypeTemplate, addServerTemplate, useLogger } from '@nuxt/kit'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { toWebRequest, serveStatic } from 'h3'
import type { Nuxt } from 'nuxt/schema'
import type { MediaMethods } from 'comark-content/plugins/media'
import { importContent } from './utils/config'
import { highlightTypesTemplate, importMetaTypesTemplate } from './utils/templates'
import { highlightStylesTemplate, highlightTemplate, resolveHighlightOptions, type ResolvedHighlightOptions } from './utils/highlight'
import { resolveTocOptions, type ResolvedTocOptions } from './utils/toc'
import { componentsTemplate } from './utils/components'
import type { ModuleOptions } from './types'
import { v3ServerPlugins } from './runtime/v3/content-plugins.server'
import { resolveContentConfigCollections, type ResolvedContentCollections } from './runtime/v3/content-config'
import { HMR_REMOVE_EVENT, HMR_UPDATE_EVENT, type ContentHmrRemove, type ContentHmrUpdate } from './runtime/utils/hmr'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

// `ContentHub<any>`: a hub over a mutable instance array isn't assignable to the
// default `ContentHub<readonly AnyComarkContent[]>` (its `query` is invariant in T).
type ContentSurface = AnyComarkContent | ContentHub<any>
type ContentWithMedia = ContentSurface & Partial<MediaMethods>

export type * from './types'

const logger = useLogger('@nuxt/content')

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

    const hasServerContent = existsSync(resolve(nuxt.options.serverDir, 'content.ts'))
    const contentConfigPaths = hasServerContent ? [] : resolveLayerContentConfigs(nuxt)
    // Evaluated here (not at runtime) so configs may use build-time APIs such as `useNuxt()`.
    const contentCollections: ResolvedContentCollections = Object.assign(
      {},
      ...contentConfigPaths.map(path => resolveContentConfigCollections(path)),
    )
    const contentPath = hasServerContent
      ? resolve(nuxt.options.serverDir, 'content')
      : contentConfigPaths.length
        ? resolve('./runtime/server/internal/content-config')
        : resolve('./runtime/server/internal/fallback-content')

    const highlight = await resolveHighlightOptions(options.build?.markdown?.highlight, nuxt)
    setupHighlight(highlight, nuxt)
    const toc = resolveTocOptions(options.build?.markdown?.toc)

    nuxt.options.vite.optimizeDeps = defu(nuxt.options.vite.optimizeDeps, {
      include: ['@nuxt/content > comark-content > slugify'],
      exclude: ['@sqlite.org/sqlite-wasm'],
    })

    // `server/content.ts` imports `createNuxtContent` from `@nuxt/content/content`. Point it at
    // this module's runtime directly: the package export targets `dist/runtime/*.js`, which a
    // stubbed build (`nuxt-module-build build --stub`) doesn't emit.
    nuxt.options.nitro.alias = defu(nuxt.options.nitro.alias, {
      '@nuxt/content/content': resolve('./runtime/server/content'),
    })

    nuxt.options.nitro.replace = defu(nuxt.options.nitro.replace, {
      'import.meta.rootDir': JSON.stringify(nuxt.options.rootDir),
      'import.meta.content.v3Compatibility': JSON.stringify(options.v3Composables ?? true),
      'import.meta.content.collections': JSON.stringify(contentCollections),
      'import.meta.content.highlight': JSON.stringify(highlight),
      'import.meta.content.toc': JSON.stringify(toc),
    })

    // The client content runtime uses top-level await. When its chunk is emitted
    // outside `node_modules` (e.g. pages provided by a layer), Nitro's esbuild pass
    // would otherwise reject it under its default `es2019` target.
    nuxt.options.nitro.esbuild = defu(nuxt.options.nitro.esbuild, {
      options: { target: 'es2022' },
    })

    nuxt.options.vite.define = defu(nuxt.options.vite.define, {
      'import.meta.content.v3Compatibility': JSON.stringify(options.v3Composables ?? true),
    })

    const content = await setupContent(contentPath, nuxt, options, contentCollections, highlight, toc)

    addServerImports({ name: 'content', from: contentPath })
    addServerHandler({ route: '/__nuxt_content/**', handler: { nuxt: resolve('./runtime/server/internal/api' + (nuxt.options.dev ? '.dev' : '')) } })

    const clientContentPath = resolve(`./runtime/client-content/${options.mode === 'hybrid' ? 'hybrid' : 'server-only'}`)
    addImports({ name: 'content', from: clientContentPath })
    addComponent({ name: 'ContentRenderer', filePath: resolve('./runtime/components/ContentRenderer') })
    addComponent({ name: 'Comark', filePath: fileURLToPath(import.meta.resolve('@comark/vue')) })

    // Markdown component tags (`::counter`) resolve against this map. Nuxt only
    // registers components lazily, so a runtime `resolveComponent` can't see them.
    addTemplate({
      filename: 'content/components.mjs',
      getContents: () => componentsTemplate(
        nuxt.apps.default?.components ?? [],
        nuxt.options._layers.map(layer => layer.config.srcDir),
      ),
      write: true,
    })

    // Typed unconditionally so the HMR plugin typechecks; only generated and used when HMR is on.
    addTypeTemplate({
      filename: 'content/client.d.ts',
      getContents: () => `export declare const content: unknown\n`,
    })
    // HMR rides on the content watcher, so `watch: false` disables both.
    if (nuxt.options.dev && options.watch) {
      // Lets the HMR plugin lazily load the same client `content` the auto-import resolves to.
      addTemplate({
        filename: 'content/client.mjs',
        getContents: () => `export { content } from ${JSON.stringify(clientContentPath)}\n`,
      })
      addPlugin({ src: resolve('./runtime/plugins/hmr.client'), mode: 'client' })
    }

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
    setupTypes(content, nuxt, contentCollections)

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

/**
 * Collect the v3 `content.config.ts` of every layer, ordered from lowest to
 * highest priority (the project itself comes last) so later configs override
 * collections of the same name — matching v3's layer behaviour.
 */
function resolveLayerContentConfigs(nuxt: Nuxt): string[] {
  return [...nuxt.options._layers]
    .reverse()
    .map(layer => join(layer.config.rootDir, 'content.config.ts'))
    .filter((path, index, paths) => existsSync(path) && paths.indexOf(path) === index)
}

function setupHighlight(highlight: ResolvedHighlightOptions | false, nuxt: Nuxt) {
  const { resolve } = createResolver(import.meta.url)

  addServerTemplate({
    filename: '#content/highlight',
    getContents: () => highlightTemplate(highlight, resolve('./runtime/server/internal/highlight')),
  })

  if (highlight && highlight.themes.dark) {
    const styles = addTemplate({ filename: 'content/highlight.css', getContents: highlightStylesTemplate, write: true })
    nuxt.options.css.push(styles.dst)
  }
}

async function setupTypes(content: ContentSurface | undefined, nuxt: Nuxt, collections: ResolvedContentCollections) {
  const importMetaTypes = addTypeTemplate({ filename: 'content/import-meta.d.ts', getContents: importMetaTypesTemplate })
  const highlightTypes = addTypeTemplate({ filename: 'content/highlight.d.ts', getContents: highlightTypesTemplate })

  const nitroTypeIncludes = [
    importMetaTypes.dst,
    highlightTypes.dst,
  ]

  nuxt.options.typescript = defu(nuxt.options.typescript, {
    tsConfig: { include: [importMetaTypes.dst, highlightTypes.dst] },
  })
  // The generated types augment `comark-content`, a transitive dependency the
  // project can't resolve on its own (pnpm) — the augmentation would be dropped.
  nuxt.options.typescript.hoist ||= []
  nuxt.options.typescript.hoist.push('comark-content')

  // Generate types
  if (content) {
    // TODO: Double check and possibly disable on build to prevent duplicate source loading
    nitroTypeIncludes.push(
      addTypeTemplate({
        filename: 'content/types.d.ts',
        getContents: () => generateContentTypes(content, collections),
      }).dst,
    )
  }

  nuxt.options.nitro.typescript = defu(nuxt.options.nitro.typescript, {
    tsConfig: { include: nitroTypeIncludes },
  })
}

/**
 * v3 typed the page `seo` field as `{ title?, description? } & Record<string, any>`
 * so extra keys (`seo.ogImage`, `seo.meta`, …) type-check. Comark's JSON Schema
 * can't express open objects, so widen the rendered type instead.
 */
function withV3FieldTypes(hooks: AnyComarkContent['hooks']): AnyComarkContent['hooks'] {
  return {
    ...hooks,
    callHook: async (name: string, ...args: unknown[]) => {
      await (hooks.callHook as (name: string, ...args: unknown[]) => Promise<unknown>)(name, ...args)
      const ctx = args[0] as TypegenFieldContext
      if (name === 'typegen:field' && ctx.path.length === 1 && (ctx.path[0] === 'seo' || ctx.path[0] === 'data.seo')) {
        ctx.type = `(${ctx.type}) & Record<string, any>`
      }
    },
  } as AnyComarkContent['hooks']
}

/**
 * Generate the `ContentRegistry` augmentation. Each instance is initialized on its
 * own so one unreadable source (e.g. a layer whose `content/` directory only
 * exists in the consuming project) doesn't drop the types of every collection:
 * it falls back to the schema declared in `content.config.ts`.
 */
async function generateContentTypes(content: ContentSurface, collections: ResolvedContentCollections): Promise<string> {
  const instances = await Promise.all(resolveInstances(content).map(async (instance) => {
    let manifest: Manifest
    try {
      await instance.init({ ignoreCache: true })
      manifest = await instance.manifest()
    }
    catch (error) {
      logger.warn(`Could not read content of \`${instance.name}\` to generate types, using its declared schema instead:`, (error as Error).message)
      const schema = collections[instance.name]?.schema ?? { type: 'object', properties: {} }
      manifest = { sources: [instance.name], items: {}, time: 0, schemas: { [instance.name]: schema } }
    }
    // Already initialized above; `generateSourceTypes` would otherwise re-init.
    return { name: instance.name, hooks: withV3FieldTypes(instance.hooks), init: async () => {}, manifest: async () => manifest } as unknown as AnyComarkContent
  }))

  try {
    return await generateSourceTypes(instances)
  }
  catch (error) {
    logger.warn('Could not generate content types:', (error as Error).message)
    return '// generateSourceTypes failed\nexport {}\n'
  }
}

function isHub(surface: ContentSurface): surface is ContentHub<any> {
  return Array.isArray((surface as ContentHub).names)
}

function resolveInstances(surface: ContentSurface): AnyComarkContent[] {
  if (isHub(surface)) {
    return surface.names.map(name => surface.from(name))
  }
  return [surface]
}

/**
 * Push watched content changes to the browser over Vite's HMR channel. The
 * client plugin (`runtime/plugins/hmr.client`) patches the in-browser instance
 * and refreshes `useAsyncData`.
 */
function setupHmr(content: ContentSurface, nuxt: Nuxt) {
  let send: ((event: string, data: unknown) => void) | undefined
  nuxt.hook('vite:serverCreated', (server, { isClient }) => {
    if (isClient) {
      send = (event, data) => server.ws.send({ type: 'custom', event, data })
    }
  })

  for (const instance of resolveInstances(content)) {
    instance.hooks.hook('watch:file:update', (source, key, file) => {
      send?.(HMR_UPDATE_EVENT, { source, key: `${source}/${key}`, file } satisfies ContentHmrUpdate)
    })
    instance.hooks.hook('watch:file:remove', (source, key) => {
      send?.(HMR_REMOVE_EVENT, { source, key: `${source}/${key}` } satisfies ContentHmrRemove)
    })
  }
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

async function setupContent(contentPath: string, nuxt: Nuxt, options: ModuleOptions, collections: ResolvedContentCollections, highlight: ResolvedHighlightOptions | false, toc: ResolvedTocOptions): Promise<ContentSurface | undefined> {
  const { resolve } = createResolver(import.meta.url)

  const imported = await importContent(nuxt.options.rootDir, contentPath, {
    collections,
    highlight,
    highlightPath: resolve('./runtime/server/internal/highlight.node'),
    toc,
    contentEntryPath: resolve('./runtime/server/content'),
  })
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
   * Keep the prerendered snapshots in server assets so the server never has to
   * request them: on serverless platforms public files only live on the CDN.
   */
  if (!nuxt.options.dev) {
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
         * In server-only mode we don't keep snapshot in public assets
         */
        if (options.mode === 'server-only') {
          route.skip = true
        }

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
        setupHmr(content, nuxt)
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
