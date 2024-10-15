import { mkdir, readFile, stat } from 'node:fs/promises'
import {
  defineNuxtModule,
  createResolver,
  addTemplate,
  addTypeTemplate,
  addImports,
  addServerImports,
  addServerHandler,
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
import { collectionsTemplate, componentsManifestTemplate, contentIntegrityTemplate, contentTypesTemplate, sqlDumpTemplate } from './utils/templates'
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
      filename: '.data/content/local.db',
    },
    database: {
      type: 'sqlite',
      filename: '.data/content/local.db',
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
        depth: 4,
        exclude: [1],
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
      collectionsIv: '-',
      contentsIv: '-',
      dump: [] as string[],
      components: [] as string[],
    }

    contentOptions._localDatabase!.filename = isAbsolute(contentOptions._localDatabase!.filename)
      ? contentOptions._localDatabase!.filename
      : join(nuxt.options.rootDir, contentOptions._localDatabase!.filename)
    await mkdir(dirname(contentOptions._localDatabase!.filename), { recursive: true }).catch(() => {})

    if ((contentOptions.database as SqliteDatabaseConfig).filename) {
      (contentOptions.database as SqliteDatabaseConfig).filename = isAbsolute((contentOptions.database as SqliteDatabaseConfig).filename)
        ? (contentOptions.database as SqliteDatabaseConfig).filename
        : join(nuxt.options.rootDir, (contentOptions.database as SqliteDatabaseConfig).filename)
      await mkdir(dirname((contentOptions.database as SqliteDatabaseConfig).filename), { recursive: true }).catch(() => {})
    }

    const { collections } = await loadContentConfig(nuxt.options.rootDir, { createOnMissing: true })

    collectionManifest.collectionsIv += hash({
      collections: collections.map(c => c.tableDefinition),
      buildOptions: contentOptions.build,
    })

    nuxt.options.runtimeConfig.public.content = {
      wsUrl: '',
    }
    nuxt.options.runtimeConfig.content = {
      // @ts-expect-error - privateRuntimeConfig is not typed
      database: contentOptions.database,
      localDatabase: contentOptions._localDatabase!,
    }

    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
    nuxt.options.vite.optimizeDeps.exclude = nuxt.options.vite.optimizeDeps.exclude || []
    nuxt.options.vite.optimizeDeps.exclude.push('@sqlite.org/sqlite-wasm')

    addServerHandler({ route: '/api/database.json', handler: resolver.resolve('./runtime/server/api/database.json') })
    addServerHandler({ route: '/api/:collection/query', handler: resolver.resolve('./runtime/server/api/[collection]/query.post'), method: 'post' })

    nuxt.options.routeRules ||= {}
    nuxt.options.routeRules['/api/database.json'] = { prerender: true }

    // Helpers are designed to be enviroment agnostic
    const autoImports = [
      { name: 'queryCollection', from: resolver.resolve('./runtime/utils/queryCollection') },
      { name: 'queryCollectionSearchSections', from: resolver.resolve('./runtime/utils/queryCollectionSearchSections') },
      { name: 'queryCollectionNavigation', from: resolver.resolve('./runtime/utils/queryCollectionNavigation') },
      { name: 'queryCollectionItemSurroundings', from: resolver.resolve('./runtime/utils/queryCollectionItemSurroundings') },
    ]
    addImports(autoImports)
    addServerImports(autoImports)
    addComponentsDir({ path: resolver.resolve('./runtime/components') })

    // Templates
    addTypeTemplate(contentTypesTemplate(collections))
    const collectionsDst = addTemplate(collectionsTemplate(collections)).dst
    const dumpDst = addTemplate(sqlDumpTemplate(collectionManifest)).dst
    const componentsDst = addTemplate(componentsManifestTemplate(collectionManifest)).dst
    const integrityDst = addTemplate(contentIntegrityTemplate(collectionManifest)).dst
    // Add aliases
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#content/collections'] = collectionsDst
    nuxt.options.nitro.alias['#content/dump'] = dumpDst
    nuxt.options.alias['#content/components'] = componentsDst
    nuxt.options.alias['#content/integrity'] = integrityDst

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
        anchorLinks: {
          // Reset defaults
          h2: false, h3: false, h4: false,
        } as Record<string, boolean>,
      },
    }

    // Apply anchor link generation config
    if (contentOptions.renderer.anchorLinks && typeof contentOptions.renderer.anchorLinks === 'object') {
      for (let i = 0; i < contentOptions.renderer.anchorLinks.depth!; i++) {
        nuxtMDCOptions.headings.anchorLinks[`h${i + 1}`] = !contentOptions.renderer.anchorLinks.exclude!.includes(i + 1)
      }
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
        collectionManifest.contentsIv = manifest.contentIv
        collectionManifest.dump = manifest.dump
        collectionManifest.components = manifest.components

        return updateTemplates({
          filter: template => [
            String(sqlDumpTemplate(collectionManifest).filename),
            String(componentsManifestTemplate(collectionManifest).filename),
            String(contentIntegrityTemplate(collectionManifest).filename),
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
  const sqlDumpList: string[] = []
  const db = localDatabase(options._localDatabase!.filename)
  const databaseContents = db.fetchDevelopmentCache()

  const startTime = performance.now()
  let filesCount = 0
  let cachedFilesCount = 0
  let parsedFilesCount = 0
  // Create database dump
  for await (const collection of collections) {
    // Collection table definition
    sqlDumpList.push(...collection.tableDefinition.split('\n'))

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

        sqlDumpList.push(generateCollectionInsert(collection, parsedContent))
      }))
    }
  }

  const infoCollection = collections.find(c => c.name === '_info')!

  const version = hash(sqlDumpList)

  sqlDumpList.push(generateCollectionInsert(infoCollection, { contentId: 'version', version }))

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
    contentIv: version,
    dump: sqlDumpList,
    components: uniqueTags,
  }
}
