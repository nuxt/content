import { comarkContent, contentHub, generateSourceTypes, isParsedSource, readArtifact } from 'comark-content'
import defu from 'defu'
import type { CacheArtifact, ContentSource, Manifest, AnyComarkContent, ContentHub, ParsedSnapshot, TypegenFieldContext } from 'comark-content'
import { defineNuxtModule, createResolver, addServerImports, addServerHandler, addImports, addComponent, addPlugin, addTemplate, addPrerenderRoutes, addDevServerHandler, addTypeTemplate, addServerTemplate, useLogger } from '@nuxt/kit'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import type { Nuxt } from 'nuxt/schema'
import type { MediaMethods } from 'comark-content/plugins/media'
import { importContent, resolveContentEntry } from './utils/config'
import { highlightTypesTemplate, importMetaTypesTemplate } from './utils/templates'
import { highlightStylesTemplate, highlightTemplate, resolveHighlightOptions, type ResolvedHighlightOptions } from './utils/highlight'
import { resolveTocOptions, type ResolvedTocOptions } from './utils/toc'
import { setupAnchorLinks } from './utils/anchor-links'
import { collectContentComponents, componentsTemplate } from './utils/components'
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
    compatibilityVersion: 3,
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    options.mode = options.mode || process.env.CONTENT_MODE as ModuleOptions['mode']
    if (!['hybrid', 'server-only'].includes(options.mode!)) {
      options.mode = 'hybrid'
    }

    const entry = resolveContentEntry(nuxt, options.compatibilityVersion!)
    // Evaluated here (not at runtime) so configs may use build-time APIs such as `useNuxt()`.
    const contentCollections: ResolvedContentCollections = Object.assign(
      {},
      ...(entry.type === 'config' ? entry.paths : []).map(path => resolveContentConfigCollections(path)),
    )
    const contentPath = entry.type === 'server'
      ? entry.path
      : entry.type === 'config'
        ? resolve('./runtime/server/internal/content-config')
        : resolve('./runtime/server/internal/fallback-content')

    const highlight = await resolveHighlightOptions(options.build?.markdown?.highlight, nuxt)
    setupHighlight(highlight, nuxt)
    const toc = resolveTocOptions(options.build?.markdown?.toc)
    const anchorLinks = setupAnchorLinks(options.renderer?.anchorLinks, nuxt)

    // Bundle `@comark/vue` with the app so it shares the app's Vue on the server. Left external
    // (e.g. with pnpm, where it isn't nested in this module's directory), it loads its own Vue:
    // `getCurrentInstance()` is `null` in its renderer, and app components aren't visible to it.
    nuxt.options.build.transpile.push('@comark/vue')

    // `server/content.ts` imports `createNuxtContent` from `@nuxt/content/content`. Point it at
    // this module's runtime directly: the package export targets `dist/runtime/*.js`, which a
    // stubbed build (`nuxt-module-build build --stub`) doesn't emit.
    nuxt.options.nitro.alias = defu(nuxt.options.nitro.alias, {
      '@nuxt/content/content': resolve('./runtime/server/content'),
    })

    nuxt.options.nitro.replace = defu(nuxt.options.nitro.replace, {
      'import.meta.rootDir': JSON.stringify(nuxt.options.rootDir),
      'import.meta.content.compatibilityVersion': JSON.stringify(options.compatibilityVersion),
      'import.meta.content.collections': JSON.stringify(contentCollections),
      'import.meta.content.highlight': JSON.stringify(highlight),
      'import.meta.content.toc': JSON.stringify(toc),
      'import.meta.content.anchorLinks': JSON.stringify(anchorLinks),
    })

    // The client content runtime uses top-level await. When its chunk is emitted
    // outside `node_modules` (e.g. pages provided by a layer), Nitro's esbuild pass
    // would otherwise reject it under its default `es2019` target.
    nuxt.options.nitro.esbuild = defu(nuxt.options.nitro.esbuild, {
      options: { target: 'es2022' },
    })

    nuxt.options.vite.define = defu(nuxt.options.vite.define, {
      'import.meta.content.compatibilityVersion': JSON.stringify(options.compatibilityVersion),
    })

    const content = await setupContent(contentPath, nuxt, options, contentCollections, highlight, toc, anchorLinks)
    // A build reads every document once, shared by the types and components templates.
    const readContent = content && !nuxt.options.dev && !nuxt.options._prepare ? createContentReader(content) : undefined

    addServerImports({ name: 'content', from: contentPath })
    addServerHandler({ route: '/__nuxt_content/**', handler: { nuxt: resolve('./runtime/server/internal/api' + (nuxt.options.dev ? '.dev' : '')) } })

    // `app/content.ts` configures the browser instance, as `server/content.ts` does the server one.
    const appContentPath = join(nuxt.options.srcDir, 'content')
    let hasAppContent = existsSync(`${appContentPath}.ts`)
    if (hasAppContent && (options.mode !== 'hybrid' || options.compatibilityVersion !== 4)) {
      logger.warn('`app/content.ts` is only used with `mode: \'hybrid\'` and `compatibilityVersion: 4`, ignoring it.')
      hasAppContent = false
    }
    nuxt.options.alias['@nuxt/content/app'] = resolve('./runtime/client-content/app')
    if (hasAppContent) {
      // `createNuxtContent()` is synchronous, so it can't fetch the manifest to know the instances.
      nuxt.options.vite.define = defu(nuxt.options.vite.define, {
        'import.meta.content.sources': JSON.stringify(content ? resolveInstanceNames(content) : []),
      })
    }
    const clientContentPath = hasAppContent ? appContentPath : resolve(`./runtime/client-content/${options.mode === 'hybrid' ? 'hybrid' : 'server-only'}`)
    addImports({ name: 'content', from: clientContentPath })
    addComponent({ name: 'ContentDocument', filePath: resolve('./runtime/components/ContentDocument') })
    // `@comark/vue` only has a named export; `addComponent` would otherwise import `default`.
    addComponent({
      name: 'Markdown',
      export: 'Markdown',
      filePath: fileURLToPath(import.meta.resolve('@comark/vue')),
    })

    // Markdown component tags (`::counter`) resolve against this map. Nuxt only
    // registers components lazily, so a runtime `resolveComponent` can't see them.
    // Documents change live in dev (and `prepare` doesn't build), so only builds
    // limit it to the components the documents use.
    let usedComponents: Promise<Set<string> | undefined> | undefined
    const componentsTemplateFile = addTemplate({
      filename: 'content/components.mjs',
      getContents: async () => componentsTemplate(
        nuxt.apps.default?.components ?? [],
        nuxt.options._layers.map(layer => layer.config.srcDir),
        readContent && await (usedComponents ||= collectUsedComponents(readContent)),
      ),
      write: true,
    })
    // Picked up by TypeScript over the `.mjs`, so its types aren't inferred from the generated imports.
    addTemplate({
      filename: 'content/components.d.mts',
      getContents: () => `import type { Component } from 'vue'\n\nexport declare const components: Record<string, Component>\n`,
      write: true,
    })
    nuxt.options.alias['#content-components'] = componentsTemplateFile.dst

    // A dynamic import deadlocks the client's top-level `await` on Nuxt 4.7; the stub keeps sqlite out of v4 bundles.
    nuxt.options.alias['#content-wasm-plugins'] = resolve(`./runtime/v3/content-plugins.${options.compatibilityVersion === 3 ? 'wasm' : 'stub'}`)

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

    if (options.compatibilityVersion === 3) {
      // Only the v3 WASM plugins load sqlite-wasm.
      nuxt.options.vite.optimizeDeps = defu(nuxt.options.vite.optimizeDeps, {
        exclude: ['@sqlite.org/sqlite-wasm'],
      })
      addComponent({ name: 'MDC', filePath: resolve('./runtime/v3/components/MDC') })
      addComponent({
        name: 'ContentRenderer',
        filePath: resolve('./runtime/v3/components/ContentRenderer'),
        // Rendered as the JSDoc of the generated component types, so editors flag `<ContentRenderer>`.
        meta: { description: '@deprecated Use `<ContentDocument>` instead.' },
      })
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
    setupTypes(content, nuxt, contentCollections, readContent, options.compatibilityVersion === 3)

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

function setupHighlight(highlight: ResolvedHighlightOptions | false, nuxt: Nuxt) {
  const { resolve } = createResolver(import.meta.url)

  addServerTemplate({
    filename: '#content/highlight',
    getContents: () => highlightTemplate(highlight, resolve('./runtime/server/internal/highlight')),
  })

  if (highlight) {
    const styles = addTemplate({ filename: 'content/highlight.css', getContents: () => highlightStylesTemplate(highlight), write: true })
    nuxt.options.css.push(styles.dst)
  }
}

async function setupTypes(content: ContentSurface | undefined, nuxt: Nuxt, collections: ResolvedContentCollections, readContent: ContentReader | undefined, v3: boolean) {
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
    nitroTypeIncludes.push(
      addTypeTemplate({
        filename: 'content/types.d.ts',
        getContents: () => generateContentTypes(content, collections, readContent, v3),
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
async function generateContentTypes(content: ContentSurface, collections: ResolvedContentCollections, readContent: ContentReader | undefined, v3: boolean): Promise<string> {
  const reads = await readContent?.()
  const instances = await Promise.all(resolveInstances(content).map(async (instance) => {
    let manifest: Manifest
    try {
      if (reads) {
        manifest = (await reads.get(instance.name)!).manifest
      }
      else {
        await instance.init({ ignoreCache: true })
        manifest = await instance.manifest()
      }
    }
    catch (error) {
      logger.warn(`Could not read content of \`${instance.name}\` to generate types, using its declared schema instead:`, (error as Error).message)
      const schema = collections[instance.name]?.schema ?? { type: 'object', properties: {} }
      manifest = { sources: [instance.name], items: {}, time: 0, schemas: { [instance.name]: schema } }
    }
    // Already initialized above; `generateSourceTypes` would otherwise re-init.
    return { name: instance.name, hooks: v3 ? withV3FieldTypes(instance.hooks) : instance.hooks, init: async () => {}, manifest: async () => manifest } as unknown as AnyComarkContent
  }))

  try {
    return await generateSourceTypes(instances)
  }
  catch (error) {
    logger.warn('Could not generate content types:', (error as Error).message)
    return '// generateSourceTypes failed\nexport {}\n'
  }
}

interface InstanceContent {
  manifest: Manifest
  items: ParsedSnapshot['items']
}

/** Every instance's content, keyed by instance name. Each entry rejects on its own when its source can't be read. */
type ContentReader = () => Promise<Map<string, Promise<InstanceContent>>>

/**
 * Read every instance fully from its source of truth, once. Types and components both
 * need the content on build: separately, a forced `init()` for the types and a full
 * one for the snapshot would walk and parse every source twice.
 */
function createContentReader(content: ContentSurface): ContentReader {
  let reads: Map<string, Promise<InstanceContent>> | undefined
  return async () => {
    reads ||= new Map(resolveInstances(content).map((instance) => {
      const read = (async () => {
        // Full and forced: the manifest and the snapshot are then served from memory.
        await instance.init({ partial: false, ignoreCache: true })
        return { manifest: await instance.manifest(), items: (await instance.snapshot()).items }
      })()
      // Handled by each consumer; don't report an unhandled rejection before one awaits it.
      read.catch(() => {})
      return [instance.name, read]
    }))
    return reads
  }
}

/**
 * Names of the components used by the documents of every instance. `undefined` when
 * a source can't be read: every project component is kept then, so documents still render.
 */
async function collectUsedComponents(readContent: ContentReader): Promise<Set<string> | undefined> {
  try {
    const reads = await Promise.all((await readContent()).values())
    return collectContentComponents(reads.flatMap(read => read.items))
  }
  catch (error) {
    logger.warn('Could not read content to find the components it uses, keeping every project component:', (error as Error).message)
    return undefined
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

// The module surface serves dev and the build's content reads, where no snapshot exists yet.
// Its `withSnapshot()` loaders need Nitro's `#imports`, so each read here would warn of a failed load.
function withoutSnapshot(source: ContentSource | undefined): ContentSource | undefined {
  if (source && isParsedSource(source) && source.__fromArtifact && source.origin) return source.origin
  return source
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
        source: withoutSnapshot(instance.options.source),
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
    source: withoutSnapshot(surface.options.source),
    cache: undefined,
    basePath: overrides.basePath ?? surface.options.basePath,
    plugins: [
      ...(surface.options.plugins ?? []),
      ...extraPlugins,
    ],
  })
}

async function setupContent(contentPath: string, nuxt: Nuxt, options: ModuleOptions, collections: ResolvedContentCollections, highlight: ResolvedHighlightOptions | false, toc: ResolvedTocOptions, anchorLinks: string[]): Promise<ContentSurface | undefined> {
  const { resolve } = createResolver(import.meta.url)

  const imported = await importContent(nuxt.options.rootDir, contentPath, {
    collections,
    highlight,
    highlightPath: resolve('./runtime/server/internal/highlight.node'),
    toc,
    anchorLinks,
    contentEntryPath: resolve('./runtime/server/content'),
  })
  // Dev server gets its own surface so plugins / basePath can differ without
  // mutating the user-exported instance that Nitro will import later.
  // Skip re-injecting v3 plugins when the export already went through
  // createNuxtContent() (it installs them once with a shared database).
  const alreadyHasV3 = Boolean(imported.content && 'query' in imported.content)
  const content = await cloneSurface(imported.content, {
    basePath: '/__NCDEV__/__nuxt_content',
    plugins: alreadyHasV3 ? [] : v3ServerPlugins(options.compatibilityVersion === 3),
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
      // The portable `nuxt` variant receives a web-standard event, so this works on h3 v1 and v2 alike.
      addDevServerHandler({ route: '/__NCDEV__/', handler: { nuxt: event => content.handler(event.req) } })

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
        nuxt: async (event) => {
          const method = event.req.method
          if (method !== 'GET' && method !== 'HEAD') return

          const info = content.stat(event.url.pathname.replace('/media', ''))
          if (info?.meta.kind !== 'media') return

          const body = await content.media.get(info.meta.key)
          if (body == null) return

          return new Response(method === 'HEAD' ? null : body as BodyInit, {
            headers: info.meta.type ? { 'content-type': info.meta.type } : undefined,
          })
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
