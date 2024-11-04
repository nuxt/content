import { mkdir, readFile } from 'node:fs/promises'
import {
  defineNuxtModule,
  createResolver,
  addTemplate,
  addTypeTemplate,
  addImports,
  addServerImports,
  addPlugin,
  updateTemplates,
  addComponentsDir,
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions as MDCModuleOptions } from '@nuxtjs/mdc'
import { hash } from 'ohash'
import { join, dirname, isAbsolute } from 'pathe'
import fastGlob from 'fast-glob'
import htmlTags from '@nuxtjs/mdc/runtime/parser/utils/html-tags-list'
import { kebabCase, pascalCase } from 'scule'
import { generateCollectionInsert, generateCollectionTableDefinition, parseSourceBase } from './utils/collection'
import { collectionsTemplate, componentsManifestTemplate, contentTypesTemplate, fullDatabaseRawDumpTemplate, manifestTemplate, moduleTemplates } from './utils/templates'
import type { ResolvedCollection } from './types/collection'
import type { ModuleOptions, SqliteDatabaseConfig } from './types/module'
import { getContentChecksum, localDatabase, logger, watchContents, chunks, watchComponents, watchConfig } from './utils/dev'
import { loadLayersConfig } from './utils/config'
import { parseContent } from './utils/content'
import { installMDCModule } from './utils/mdc'
import { findPreset } from './presets'
import type { Manifest } from './types/manifest'

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
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const manifest: Manifest = {
      checksum: {},
      dump: {},
      components: [],
      collections: [],
    }

    options._localDatabase!.filename = isAbsolute(options._localDatabase!.filename)
      ? options._localDatabase!.filename
      : join(nuxt.options.rootDir, options._localDatabase!.filename)
    await mkdir(dirname(options._localDatabase!.filename), { recursive: true }).catch(() => {})

    if ((options.database as SqliteDatabaseConfig).filename) {
      (options.database as SqliteDatabaseConfig).filename = (options.database as SqliteDatabaseConfig).filename
      await mkdir(dirname((options.database as SqliteDatabaseConfig).filename), { recursive: true }).catch(() => {})
    }

    const { collections } = await loadLayersConfig(nuxt)
    manifest.collections = collections

    nuxt.options.runtimeConfig.public.content = {
      wsUrl: '',
    }
    nuxt.options.runtimeConfig.content = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      database: options.database as any,
      localDatabase: options._localDatabase!,
    }

    nuxt.options.vite.optimizeDeps ||= {}
    nuxt.options.vite.optimizeDeps.exclude ||= []
    nuxt.options.vite.optimizeDeps.exclude.push('@sqlite.org/sqlite-wasm')
    nuxt.options.vite.optimizeDeps.include ||= []
    nuxt.options.vite.optimizeDeps.include.push('scule', 'pako')

    // Helpers are designed to be enviroment agnostic
    addImports([
      { name: 'queryCollection', from: resolver.resolve('./runtime/app') },
      { name: 'queryCollectionSearchSections', from: resolver.resolve('./runtime/app') },
      { name: 'queryCollectionNavigation', from: resolver.resolve('./runtime/app') },
      { name: 'queryCollectionItemSurroundings', from: resolver.resolve('./runtime/app') },
      { name: 'useContentHead', from: resolver.resolve('./runtime/app') },
    ])
    addServerImports([
      { name: 'queryCollectionWithEvent', as: 'queryCollection', from: resolver.resolve('./runtime/nitro') },
      { name: 'queryCollectionSearchSectionsWithEvent', as: 'queryCollectionSearchSections', from: resolver.resolve('./runtime/nitro') },
      { name: 'queryCollectionNavigationWithEvent', as: 'queryCollectionNavigation', from: resolver.resolve('./runtime/nitro') },
      { name: 'queryCollectionItemSurroundingsWithEvent', as: 'queryCollectionItemSurroundings', from: resolver.resolve('./runtime/nitro') },
    ])
    addComponentsDir({ path: resolver.resolve('./runtime/components') })

    // Add Templates & aliases
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    addTypeTemplate(contentTypesTemplate(manifest.collections))
    addTemplate(fullDatabaseRawDumpTemplate(manifest))
    nuxt.options.nitro.alias['#content/collections'] = addTemplate(collectionsTemplate(manifest.collections)).dst
    nuxt.options.alias['#content/components'] = addTemplate(componentsManifestTemplate(manifest)).dst
    nuxt.options.alias['#content/manifest'] = addTemplate(manifestTemplate(manifest)).dst

    // Load preset
    nuxt.hook('nitro:config', async (config) => {
      const preset = findPreset(nuxt)
      await preset.setupNitro(config, { manifest, resolver })

      const adapter = config.runtimeConfig!.content!.database?.type || options.database.type || 'sqlite'
      config.alias ||= {}
      config.alias['#content/adapter'] = resolver.resolve(`./runtime/adapters/${adapter}`)

      config.handlers ||= []
      config.handlers.push({
        route: '/api/content/:collection/query',
        handler: resolver.resolve('./runtime/api/query.post'),
      })
    })

    nuxt.options.routeRules ||= {}
    manifest.collections.forEach((collection) => {
      if (!collection.private) {
        nuxt.options.routeRules![`/api/content/${collection.name}/database.sql`] = { prerender: true }
      }
    })

    await installMDCModule(options, nuxt)

    if (nuxt.options._prepare) {
      return
    }

    const dumpGeneratePromise = processCollectionItems(nuxt, manifest.collections, options)
      .then((fest) => {
        manifest.checksum = fest.checksum
        manifest.dump = fest.dump
        manifest.components = fest.components

        return updateTemplates({
          filter: template => [
            moduleTemplates.fullRawDump,
            moduleTemplates.fullCompressedDump,
            moduleTemplates.manifest,
            moduleTemplates.components,
          ].includes(template.filename),
        })
      })

    nuxt.hook('app:templates', async () => {
      await dumpGeneratePromise
    })

    if (nuxt.options.dev) {
      addPlugin({ src: resolver.resolve('./runtime/plugins/websocket.dev'), mode: 'client' })
      await watchContents(nuxt, options, manifest)
      await watchComponents(nuxt)
      await watchConfig(nuxt)
    }
  },
})

async function processCollectionItems(nuxt: Nuxt, collections: ResolvedCollection[], options: ModuleOptions) {
  const collectionDump: Record<string, string[]> = {}
  const collectionChecksum: Record<string, string> = {}
  const db = localDatabase(options._localDatabase!.filename)
  const databaseContents = db.fetchDevelopmentCache()

  const configHash = hash({
    mdcHighlight: (nuxt.options as unknown as { mdc: MDCModuleOptions }).mdc?.highlight,
    contentBuild: options.build?.markdown,
  })

  const infoCollection = collections.find(c => c.name === '_info')!

  const startTime = performance.now()
  let filesCount = 0
  let cachedFilesCount = 0
  let parsedFilesCount = 0
  // Create database dump
  for await (const collection of collections) {
    if (collection.name === '_info') {
      continue
    }
    collectionDump[collection.name] = []
    // Collection table definition
    collectionDump[collection.name].push(
      ...generateCollectionTableDefinition(collection, { drop: true }).split('\n'),
    )

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
        const checksum = getContentChecksum(configHash + content)
        const cache = databaseContents[keyInCollection]

        let parsedContent
        if (cache && cache.checksum === checksum) {
          cachedFilesCount += 1
          parsedContent = JSON.parse(cache.parsedContent)
        }
        else {
          parsedFilesCount += 1
          parsedContent = await parseContent(keyInCollection, content, collection, nuxt)
          db.insertDevelopmentCache(keyInCollection, checksum, JSON.stringify(parsedContent))
        }

        list.push([key, generateCollectionInsert(collection, parsedContent)])
      }))
    }
    // Sort by file name to ensure consistent order
    list.sort((a, b) => a[0].localeCompare(String(b[0])))
    collectionDump[collection.name].push(...list.map(([, sql]) => sql))

    collectionChecksum[collection.name] = hash(collectionDump[collection.name])

    collectionDump[collection.name].push(
      generateCollectionTableDefinition(infoCollection, { drop: false }),
      `DELETE FROM ${infoCollection.tableName} WHERE _id = 'checksum_${collection.name}'`,
      generateCollectionInsert(infoCollection, { _id: `checksum_${collection.name}`, version: collectionChecksum[collection.name] }),
    )
  }

  const sqlDumpList = Object.values(collectionDump).flatMap(a => a)

  // Drop _info table and recreate it
  db.exec(`DROP TABLE IF EXISTS ${infoCollection.tableName}`)
  for (const sql of sqlDumpList) {
    db.exec(sql)
  }

  const tags = sqlDumpList.flatMap(sql => sql.match(/(?<=(^|,|\[)\[")[^"]+(?=")/g) || [])
  const uniqueTags = [
    ...Object.values(options.renderer.alias || {}),
    ...new Set(tags),
  ]
    .filter(tag => !htmlTags.includes(kebabCase(tag)))
    .map(tag => pascalCase(tag))

  const endTime = performance.now()
  logger.success(`Processed ${collections.length} collections and ${filesCount} files in ${(endTime - startTime).toFixed(2)}ms (${cachedFilesCount} cached, ${parsedFilesCount} parsed)`)

  return {
    checksum: collectionChecksum,
    dump: collectionDump,
    components: uniqueTags,
  }
}
