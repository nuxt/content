import { mkdir, readFile, stat } from 'node:fs/promises'
import {
  defineNuxtModule,
  createResolver,
  addTemplate,
  addTypeTemplate,
  addImports,
  addServerImports,
  installModule,
  addPlugin,
  updateTemplates,
  addComponentsDir,
  extendViteConfig,
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { hash } from 'ohash'
import { join, dirname, isAbsolute } from 'pathe'
import fastGlob from 'fast-glob'
import type { ModuleOptions as MDCModuleOptions } from '@nuxtjs/mdc'
import htmlTags from '@nuxtjs/mdc/runtime/parser/utils/html-tags-list'
import { kebabCase, pascalCase } from 'scule'
import { generateCollectionInsert, parseSourceBase } from './utils/collection'
import { collectionsTemplate, componentsManifestTemplate, contentTypesTemplate, manifestTemplate, sqlDumpTemplate, sqlDumpTemplateRaw } from './utils/templates'
import type { ResolvedCollection } from './types/collection'
import type { ModuleOptions, SqliteDatabaseConfig } from './types/module'
import { getContentChecksum, localDatabase, logger, watchContents, chunks, watchComponents, watchConfig } from './utils/dev'
import { loadContentConfig } from './utils/config'
import { parseContent } from './utils/content'

// Export public utils
export * from './utils'
export type * from './types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'Content',
    configKey: 'content',
  },
  defaults: {
    _localDatabase: {
      type: 'sqlite',
      filename: '.data/content/contents.sqlite',
    },
    database: {
      type: 'sqlite',
      filename: './contents.sqlite',
    },
    watch: {
      enabled: true,
      port: {
        port: 4000,
        portRange: [4000, 4040],
      },
      hostname: 'localhost',
      showURL: false,
    },
    renderer: {
      alias: {},
      anchorLinks: {
        h2: true,
        h3: true,
        h4: true,
      },
    },
    build: {
      markdown: {},
      yaml: {},
      csv: {
        delimeter: ',',
        json: true,
      },
    },
  },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const contentOptions = { ..._options }
    const collectionManifest = {
      integrityVersion: '-',
      dump: [] as string[],
      components: [] as string[],
    }

    contentOptions._localDatabase!.filename = isAbsolute(contentOptions._localDatabase!.filename)
      ? contentOptions._localDatabase!.filename
      : join(nuxt.options.rootDir, contentOptions._localDatabase!.filename)
    await mkdir(dirname(contentOptions._localDatabase!.filename), { recursive: true }).catch(() => {})

    if ((contentOptions.database as SqliteDatabaseConfig).filename) {
      (contentOptions.database as SqliteDatabaseConfig).filename = (contentOptions.database as SqliteDatabaseConfig).filename
      await mkdir(dirname((contentOptions.database as SqliteDatabaseConfig).filename), { recursive: true }).catch(() => {})
    }

    const { collections } = await loadContentConfig(nuxt.options.rootDir, { defaultFallback: true })

    nuxt.options.runtimeConfig.public.content = {
      wsUrl: '',
    }
    nuxt.options.runtimeConfig.content = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      database: contentOptions.database as any,
      localDatabase: contentOptions._localDatabase!,
    }

    nuxt.options.vite.optimizeDeps ||= {}
    nuxt.options.vite.optimizeDeps.exclude ||= []
    nuxt.options.vite.optimizeDeps.exclude.push('@sqlite.org/sqlite-wasm')
    nuxt.options.vite.optimizeDeps.include ||= []
    nuxt.options.vite.optimizeDeps.include.push('scule', 'pako')

    // Helpers are designed to be enviroment agnostic
    const nuxtAutoImports = [
      { name: 'queryCollection', from: resolver.resolve('./runtime/index') },
      { name: 'queryCollectionSearchSections', from: resolver.resolve('./runtime/index') },
      { name: 'queryCollectionNavigation', from: resolver.resolve('./runtime/index') },
      { name: 'queryCollectionItemSurroundings', from: resolver.resolve('./runtime/index') },
    ]
    const nitroAutoImports = [
      { name: 'queryCollectionWithEvent', as: 'queryCollection', from: resolver.resolve('./runtime/server/index') },
      { name: 'queryCollectionSearchSectionsWithEvent', as: 'queryCollectionSearchSections', from: resolver.resolve('./runtime/server/index') },
      { name: 'queryCollectionNavigationWithEvent', as: 'queryCollectionNavigation', from: resolver.resolve('./runtime/server/index') },
      { name: 'queryCollectionItemSurroundingsWithEvent', as: 'queryCollectionItemSurroundings', from: resolver.resolve('./runtime/server/index') },
    ]
    addImports(nuxtAutoImports)
    addServerImports(nitroAutoImports)
    addComponentsDir({ path: resolver.resolve('./runtime/components') })

    // Templates
    addTypeTemplate(contentTypesTemplate(collections))
    const sqlDumpDst = addTemplate(sqlDumpTemplate(collectionManifest)).dst
    const manifestDst = addTemplate(manifestTemplate(collections, collectionManifest)).dst
    const collectionsDst = addTemplate(collectionsTemplate(collections)).dst
    const componentsDst = addTemplate(componentsManifestTemplate(collectionManifest)).dst
    addTemplate(sqlDumpTemplateRaw(collectionManifest))
    // Add aliases
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#content/collections'] = collectionsDst
    nuxt.options.alias['#content/components'] = componentsDst
    nuxt.options.alias['#content/manifest'] = manifestDst

    nuxt.hook('nitro:config', (config) => {
      config.publicAssets ||= []
      config.alias = config.alias || {}
      config.handlers ||= []

      if (config.preset === 'cloudflare-pages') {
        config.publicAssets.push({ dir: join(nuxt.options.buildDir, 'content', 'raw'), maxAge: 60 })

        config.handlers.push({
          route: '/api/content/database.json',
          handler: resolver.resolve('./runtime/presets/cloudflare-pages/database'),
        })
      }
      else {
        config.alias['#content/dump'] = sqlDumpDst
        config.handlers.push({
          route: '/api/content/database.json',
          handler: resolver.resolve('./runtime/presets/node/database'),
        })
      }
    })

    nuxt.options.routeRules ||= {}
    nuxt.options.routeRules['/api/content/database.json'] = { prerender: true }
    // Register user global components
    const _layers = [...nuxt.options._layers].reverse()
    for (const layer of _layers) {
      const srcDir = layer.config.srcDir
      const globalComponents = resolver.resolve(srcDir, 'components/content')
      const dirStat = await stat(globalComponents).catch(() => null)
      if (dirStat && dirStat.isDirectory()) {
        nuxt.hook('components:dirs', (dirs) => {
          dirs.unshift({
            path: globalComponents,
            global: true,
            pathPrefix: false,
            prefix: '',
          })
        })
      }
    }

    // Install mdc module
    const highlight = contentOptions.build?.markdown?.highlight as unknown as MDCModuleOptions['highlight']
    const nuxtMDCOptions = {
      highlight: highlight ? { ...highlight, noApiRoute: true } : highlight,
      components: {
        prose: true,
        map: contentOptions.renderer.alias,
      },
      headings: {
        anchorLinks: contentOptions.renderer.anchorLinks,
      },
    }

    await installModule('@nuxtjs/mdc', nuxtMDCOptions)

    // Update mdc optimizeDeps options
    extendViteConfig((config) => {
      config.optimizeDeps ||= {}
      config.optimizeDeps.include ||= []
      config.optimizeDeps.include.push('@nuxt/content > slugify')
      config.optimizeDeps.include = config.optimizeDeps.include
        .map(id => id.replace(/^@nuxtjs\/mdc > /, '@nuxt/content > @nuxtjs/mdc > '))
    })

    if (nuxt.options._prepare) {
      return
    }

    const dumpGeneratePromise = processCollectionItems(nuxt, collections, contentOptions)
      .then((manifest) => {
        collectionManifest.integrityVersion = manifest.integrityVersion
        collectionManifest.dump = manifest.dump
        collectionManifest.components = manifest.components

        return updateTemplates({
          filter: template => [
            String(sqlDumpTemplateRaw(collectionManifest).filename),
            String(componentsManifestTemplate(collectionManifest).filename),
            String(manifestTemplate(collections, collectionManifest).filename),
          ].includes(template.filename),
        })
      })

    nuxt.hook('app:templates', async () => {
      await dumpGeneratePromise
    })

    if (nuxt.options.dev) {
      addPlugin({ src: resolver.resolve('./runtime/plugins/websocket.dev'), mode: 'client' })
      await watchContents(nuxt, collections, contentOptions, collectionManifest)
      await watchComponents(nuxt)
      await watchConfig(nuxt)
    }
  },
})

async function processCollectionItems(nuxt: Nuxt, collections: ResolvedCollection[], options: ModuleOptions) {
  const collectionDump: Record<string, string[]> = {}
  const db = localDatabase(options._localDatabase!.filename)
  const databaseContents = db.fetchDevelopmentCache()

  const startTime = performance.now()
  let filesCount = 0
  let cachedFilesCount = 0
  let parsedFilesCount = 0
  // Create database dump
  for await (const collection of collections) {
    collectionDump[collection.name] = []
    // Collection table definition
    collectionDump[collection.name].push(...collection.tableDefinition.split('\n'))

    if (!collection.source) {
      continue
    }

    if (collection.source.prepare) {
      await collection.source.prepare(nuxt)
    }

    const { fixed, dynamic } = parseSourceBase(collection.source)
    const cwd = join(collection.source.cwd, fixed)

    const _keys = await fastGlob(dynamic, { cwd, ignore: collection.source!.ignore || [], dot: true })
      .catch(() => [])

    filesCount += _keys.length

    const list: Array<Array<string>> = []
    for await (const chunk of chunks(_keys, 25)) {
      await Promise.all(chunk.map(async (key) => {
        const keyInCollection = join(collection.name, collection.source?.prefix || '', key)
        const content = await readFile(join(cwd, key), 'utf8')
        const checksum = getContentChecksum(content)
        const cache = databaseContents[keyInCollection]

        let parsedContent
        if (cache && cache.checksum === checksum) {
          cachedFilesCount += 1
          parsedContent = JSON.parse(cache.parsedContent)
        }
        else {
          parsedFilesCount += 1
          parsedContent = await parseContent(keyInCollection, content, collection, options.build)
          db.insertDevelopmentCache(keyInCollection, checksum, JSON.stringify(parsedContent))
        }

        list.push([key, generateCollectionInsert(collection, parsedContent)])
      }))
    }
    // Sort by file name to ensure consistent order
    list.sort((a, b) => a[0].localeCompare(String(b[0])))
    collectionDump[collection.name].push(...list.map(([, sql]) => sql))
  }

  const infoCollection = collections.find(c => c.name === '_info')!

  const version = hash(collectionDump)

  collectionDump._info.push(generateCollectionInsert(infoCollection, { contentId: 'version', version }))

  const sqlDumpList = Object.values(collectionDump).flatMap(a => a)

  for (const sql of sqlDumpList) {
    db.exec(sql)
  }

  const tags = sqlDumpList.flatMap(sql => sql.match(/"tag":"([^"]+)"/g) || [])
  const uniqueTags = [
    ...Object.values(options.renderer.alias || {}),
    ...new Set(tags),
  ]
    .map(tag => tag.substring(7, tag.length - 1))
    .filter(tag => !htmlTags.includes(kebabCase(tag)))
    .map(tag => pascalCase(tag))

  const endTime = performance.now()
  logger.success(`Processed ${collections.length} collections and ${filesCount} files in ${(endTime - startTime).toFixed(2)}ms (${cachedFilesCount} cached, ${parsedFilesCount} parsed)`)

  return {
    integrityVersion: version,
    dump: sqlDumpList,
    components: uniqueTags,
  }
}
