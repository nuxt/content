import { comarkContent, contentHub, generateSourceTypes, isParsedSource, readArtifact } from 'comark-content'
import defu from 'defu'
import type { CacheArtifact, ContentSource, Manifest, AnyComarkContent, ContentHub, ParsedSnapshot, TypegenFieldContext } from 'comark-content'
import { defineNuxtModule, createResolver, addServerImports, addServerHandler, addImports, addComponent, addPlugin, addTemplate, addPrerenderRoutes, addDevServerHandler, addTypeTemplate, addServerTemplate, resolvePath, useLogger } from '@nuxt/kit'
import { mkdir, writeFile } from 'node:fs/promises'
import type { Nuxt } from 'nuxt/schema'
import type { MediaMethods } from 'comark-content/plugins/media'
import { importContent, resolveContentEntry, resolveLayerAppFile } from './utils/config'
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

// `ContentHub<any>`: its `query` is invariant in T, so a hub over a mutable array isn't a `ContentHub<readonly AnyComarkContent[]>`.
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
  defaults: {
    watch: true,
    compatibilityVersion: 3,
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    /**
     * Options
     */
    options.mode = options.mode || process.env.CONTENT_MODE as ModuleOptions['mode']
    if (!['hybrid', 'server-only'].includes(options.mode!)) {
      options.mode = 'hybrid'
    }

    /**
     * Entry files, from the app then its layers
     */
    const entry = resolveContentEntry(nuxt, options.compatibilityVersion!)
    const serverContentPath = entry.type === 'server'
      ? entry.path
      : entry.type === 'config'
        ? resolve('./runtime/server/internal/content-config')
        : resolve('./runtime/server/internal/fallback-content')
    // `app/content.ts` configures the browser instance, as `server/content.ts` does the server one.
    let appContentPath = resolveLayerAppFile(nuxt, 'content.ts')?.slice(0, -'.ts'.length)
    if (appContentPath && (options.mode !== 'hybrid' || options.compatibilityVersion !== 4)) {
      logger.warn('`app/content.ts` is only used with `mode: \'hybrid\'` and `compatibilityVersion: 4`, ignoring it. Use `app/content.worker.ts` for content in the browser in server-only mode.')
      appContentPath = undefined
    }
    // `app/content.worker.ts` runs instances in a web worker, hydrated from the public snapshots.
    const workerPath = resolveLayerAppFile(nuxt, 'content.worker.ts')

    /**
     * Build config
     */
    // Evaluated here (not at runtime) so configs may use build-time APIs such as `useNuxt()`.
    const contentCollections: ResolvedContentCollections = Object.assign(
      {},
      ...(entry.type === 'config' ? entry.paths : []).map(path => resolveContentConfigCollections(path)),
    )
    const highlight = await resolveHighlightOptions(options.build?.markdown?.highlight, nuxt)
    setupHighlight(highlight, nuxt)
    const toc = resolveTocOptions(options.build?.markdown?.toc)
    const anchorLinks = setupAnchorLinks(options.renderer?.anchorLinks, nuxt)

    // Bundled so it shares the app's Vue on the server: left external (pnpm), it loads its own and can't see app components.
    nuxt.options.build.transpile.push('@comark/vue')

    // Point the entries' imports at the runtime: the package exports target `dist/runtime/*.js`, which a stubbed build doesn't emit.
    nuxt.options.nitro.alias = defu(nuxt.options.nitro.alias, {
      '@nuxt/content/content': resolve('./runtime/server/content'),
    })
    nuxt.options.alias['@nuxt/content/app'] = resolve('./runtime/client-content/app')
    nuxt.options.alias['@nuxt/content/worker'] = resolve('./runtime/client-content/worker')

    nuxt.options.nitro.replace = defu(nuxt.options.nitro.replace, {
      'import.meta.rootDir': JSON.stringify(nuxt.options.rootDir),
      'import.meta.content.compatibilityVersion': JSON.stringify(options.compatibilityVersion),
      'import.meta.content.collections': JSON.stringify(contentCollections),
      'import.meta.content.highlight': JSON.stringify(highlight),
      'import.meta.content.toc': JSON.stringify(toc),
      'import.meta.content.anchorLinks': JSON.stringify(anchorLinks),
    })

    // The client runtime uses top-level `await`, which Nitro's default `es2019` rejects in chunks outside `node_modules`.
    nuxt.options.nitro.esbuild = defu(nuxt.options.nitro.esbuild, {
      options: { target: 'es2022' },
    })

    nuxt.options.vite.define = defu(nuxt.options.vite.define, {
      'import.meta.content.compatibilityVersion': JSON.stringify(options.compatibilityVersion),
    })

    /**
     * Server
     */
    const content = await setupContent(serverContentPath, nuxt, options, contentCollections, highlight, toc, anchorLinks, !!workerPath)
    // A build reads every document once, shared by the types and components templates.
    const readContent = content && !nuxt.options.dev && !nuxt.options._prepare ? createContentReader(content) : undefined

    addServerImports({ name: 'content', from: serverContentPath })
    addServerHandler({ route: '/__nuxt_content/**', handler: { nuxt: resolve('./runtime/server/internal/api' + (nuxt.options.dev ? '.dev' : '')) } })

    /**
     * Browser
     */
    if (appContentPath || workerPath) {
      // `createNuxtContent()` is synchronous, so it can't fetch the manifest to know the instances.
      nuxt.options.vite.define = defu(nuxt.options.vite.define, {
        'import.meta.content.sources': JSON.stringify(content ? resolveInstanceNames(content) : []),
      })
    }
    const clientContentPath = appContentPath ?? resolve(`./runtime/client-content/${options.mode === 'hybrid' ? 'hybrid' : 'server-only'}`)
    addImports({ name: 'content', from: clientContentPath })
    // A dynamic import deadlocks the client's top-level `await` on Nuxt 4.7; the stub keeps sqlite out of v4 bundles.
    nuxt.options.alias['#content-wasm-plugins'] = resolve(`./runtime/v3/content-plugins.${options.compatibilityVersion === 3 ? 'wasm' : 'stub'}`)
    if (workerPath) {
      await setupWorker(workerPath, content ? resolveInstanceNames(content) : [], nuxt)
    }

    /**
     * Components
     */
    addComponent({ name: 'ContentDocument', filePath: resolve('./runtime/components/ContentDocument') })
    // `@comark/vue` only has a named export; `addComponent` would otherwise import `default`.
    addComponent({
      name: 'Markdown',
      export: 'Markdown',
      filePath: fileURLToPath(import.meta.resolve('@comark/vue')),
    })

    // Markdown tags (`::counter`) resolve against this map: Nuxt registers components lazily, so `resolveComponent` can't see them.
    // Only builds limit it to the components the documents use, since documents change in dev.
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

    /**
     * Dev HMR
     */
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

    /**
     * v3 compatibility
     */
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
     * Types
     */
    setupTypes(content, nuxt, contentCollections, readContent, options.compatibilityVersion === 3)

    /**
     * Media, skipped in prepare
     */
    if (nuxt.options._prepare) return
    if (content && 'media' in content && content.media) setupMedia(content as ContentWithMedia & MediaMethods, nuxt)
  },
})

/**
 * Bundle `app/content.worker.ts` into a web worker, which Vite builds from a generated entry as its own chunk.
 * Only the worker imports the file, so its plugins never reach the app's bundle.
 */
async function setupWorker(workerPath: string, names: string[], nuxt: Nuxt) {
  const { resolve } = createResolver(import.meta.url)
  const runtime = await resolvePath(resolve('./runtime/client-content/worker'))
  // Written to disk: Vite bundles workers without Nuxt's plugins, which serve the other templates from memory.
  const entry = addTemplate({
    // Names the worker's chunk, `content-worker-<hash>.js`.
    filename: 'content/content-worker.mjs',
    write: true,
    getContents: () => [
      `import definition from ${JSON.stringify(workerPath)}`,
      `import { startNuxtContentWorker } from ${JSON.stringify(runtime)}`,
      // The `app.baseURL` of the build: a base set at runtime with `NUXT_APP_BASE_URL` isn't supported.
      `startNuxtContentWorker(definition, ${JSON.stringify(names)}, ${JSON.stringify(nuxt.options.app.baseURL)})`,
    ].join('\n') + '\n',
  })
  nuxt.options.alias['@nuxt/content/worker-entry'] = entry.dst
  // Vite lists the worker as an asset of the app's entry, which Nuxt would preload on every page.
  nuxt.hook('build:manifest', (manifest) => {
    for (const chunk of Object.values(manifest)) {
      if (/^(?:.*\/)?content-worker-[\w-]+\.js$/.test(chunk.file)) {
        chunk.preload = false
        chunk.prefetch = false
      }
    }
  })
  addImports({ name: 'useNuxtContentWorker', from: resolve('./runtime/client-content/worker-client') })

  nuxt.options.vite.optimizeDeps = defu(nuxt.options.vite.optimizeDeps, {
    // Pre-bundled, it can't find its `sqlite3.wasm` next to it.
    exclude: ['@sqlite.org/sqlite-wasm'],
  })
  const workerPlugins = nuxt.options.vite.worker?.plugins
  nuxt.options.vite.worker = {
    ...nuxt.options.vite.worker,
    // Vite flattens nested and pending plugin lists, so the app's are kept as one entry.
    plugins: () => [workerPlugins?.(), sqliteWorkerFilesPlugin(entry.dst)],
  }
}

/**
 * sqlite-wasm references its Worker1 API and OPFS helper with `new URL(…, import.meta.url)`, so Vite emits both.
 * An in-memory database loads neither, so they throw instead; sqlite-wasm catches the failed OPFS install.
 * TODO: use the plugin from comark-content once it ships there.
 */
function sqliteWorkerFilesPlugin(entry: string) {
  const files = /new URL\("(sqlite3-worker1\.mjs|sqlite3-opfs-async-proxy\.js)", import\.meta\.url\)/
  // Vite creates the worker plugins for each worker bundle: only the content worker's rewrites, the app's other workers keep both files.
  let active = false
  return {
    name: 'nuxt-content:sqlite-worker-files',
    enforce: 'pre' as const,
    buildStart(options: { input: string[] | Record<string, string> }) {
      active = Object.values(options.input).includes(entry)
    },
    transform: {
      filter: { id: /[\\/]@sqlite\.org[\\/]sqlite-wasm[\\/]/, code: files },
      handler: (code: string) => active ? code.replace(new RegExp(files, 'g'), (_, file: string) => `(() => { throw new Error(${JSON.stringify(`\`${file}\` isn't bundled with the Nuxt Content worker.`)}) })()`) : undefined,
    },
  }
}

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
  // The types augment `comark-content`, which the project can't resolve on its own with pnpm.
  nuxt.options.typescript.hoist ||= []
  nuxt.options.typescript.hoist.push('comark-content')

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
 * v3 typed `seo` as `{ title?, description? } & Record<string, any>`, so extra keys like `seo.ogImage` type-check.
 * Comark's JSON Schema can't express open objects, so the rendered type is widened instead.
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
 * Generate the `ContentRegistry` augmentation.
 * An unreadable source, such as a layer's missing `content/`, falls back to its declared schema instead of dropping every type.
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
 * Read every instance fully from its source, once.
 * Types and components both need it on build; reading for each would parse every source twice.
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
 * Names of the components the documents use.
 * `undefined` when a source can't be read, so every project component is kept.
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
 * Push watched content changes to the browser over Vite's HMR channel.
 * `runtime/plugins/hmr.client` patches the browser instance and refreshes `useAsyncData`.
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

// The module surface reads before any snapshot exists, and `withSnapshot()` loaders need Nitro's `#imports`.
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

async function setupContent(contentPath: string, nuxt: Nuxt, options: ModuleOptions, collections: ResolvedContentCollections, highlight: ResolvedHighlightOptions | false, toc: ResolvedTocOptions, anchorLinks: string[], publicSnapshots: boolean): Promise<ContentSurface | undefined> {
  const { resolve } = createResolver(import.meta.url)

  const imported = await importContent(nuxt.options.rootDir, contentPath, {
    collections,
    highlight,
    highlightPath: resolve('./runtime/server/internal/highlight.node'),
    toc,
    anchorLinks,
    contentEntryPath: resolve('./runtime/server/content'),
  })
  // A separate surface, so the dev plugins and `basePath` don't mutate the instance Nitro imports.
  // `createNuxtContent()` already installed the v3 plugins with a shared database.
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

  // Snapshots go to server assets too: on serverless platforms public files only live on the CDN.
  if (!nuxt.options.dev) {
    nuxt.hook('nitro:init', async (nitro) => {
      const dir = resolve(nuxt.options.buildDir, 'content/prerender')
      nitro.options.serverAssets.push({ baseName: 'content', dir })
      nitro.hooks.hook('prerender:generate', async (route) => {
        if (!route.route.startsWith('/__nuxt_content')) return
        // Server-only mode keeps them private, except the snapshots `app/content.worker.ts` hydrates from.
        if (options.mode === 'server-only' && !(publicSnapshots && route.route.startsWith('/__nuxt_content/snapshot/'))) {
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
          const file = route.route.split('/').pop()!
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
