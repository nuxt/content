import { mkdir, stat } from 'node:fs/promises'
import {
  defineNuxtModule,
  createResolver,
  addTemplate,
  addTypeTemplate,
  addImports,
  addServerImports,
  addPlugin,
  updateTemplates,
  addComponent,
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions as MDCModuleOptions } from '@nuxtjs/mdc'
import { hash } from 'ohash'
import { join, dirname, isAbsolute } from 'pathe'
import htmlTags from '@nuxtjs/mdc/runtime/parser/utils/html-tags-list'
import { kebabCase, pascalCase } from 'scule'
import { version } from '../package.json'
import { generateCollectionInsert, generateCollectionTableDefinition } from './utils/collection'
import { componentsManifestTemplate, contentTypesTemplate, fullDatabaseRawDumpTemplate, manifestTemplate, moduleTemplates } from './utils/templates'
import type { ResolvedCollection } from './types/collection'
import type { ModuleOptions, SqliteDatabaseConfig } from './types/module'
import { getContentChecksum, logger, watchContents, chunks, watchComponents, startSocketServer } from './utils/dev'
import { loadContentConfig } from './utils/config'
import { createParser } from './utils/content'
import { installMDCModule } from './utils/mdc'
import { findPreset } from './presets'
import type { Manifest } from './types/manifest'
import { setupPreview } from './utils/preview/module'
import { parseSourceBase } from './utils/source'
import { getLocalDatabase } from './utils/sqlite'

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
    preview: {},
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
      pathMeta: {},
      markdown: {},
      yaml: {},
      csv: {
        delimeter: ',',
        json: true,
      },
    },
  },
  async setup(options, nuxt) {
    // Provide default database configuration here since nuxt is merging defaults and user options
    if (!options.database) {
      options.database = {
        type: 'sqlite',
        filename: './contents.sqlite',
      }
    }

    const resolver = createResolver(import.meta.url)
    const manifest: Manifest = {
      checksum: {},
      dump: {},
      components: [],
      collections: [],
    }

    // Create local database
    options._localDatabase!.filename = isAbsolute(options._localDatabase!.filename)
      ? options._localDatabase!.filename
      : join(nuxt.options.rootDir, options._localDatabase!.filename)
    await mkdir(dirname(options._localDatabase!.filename), { recursive: true }).catch(() => {})

    // Create sql database
    if ((options.database as SqliteDatabaseConfig).filename) {
      (options.database as SqliteDatabaseConfig).filename = (options.database as SqliteDatabaseConfig).filename
      await mkdir(dirname((options.database as SqliteDatabaseConfig).filename), { recursive: true }).catch(() => {})
    }
    const { collections } = await loadContentConfig(nuxt)
    manifest.collections = collections

    // Module Options
    nuxt.options.runtimeConfig.public.content = {
      wsUrl: '',
    }
    nuxt.options.runtimeConfig.content = {
      version,
      database: options.database,
      localDatabase: options._localDatabase!,
    } as never

    nuxt.options.vite.optimizeDeps ||= {}
    nuxt.options.vite.optimizeDeps.exclude ||= []
    nuxt.options.vite.optimizeDeps.exclude.push('@sqlite.org/sqlite-wasm')
    nuxt.options.vite.optimizeDeps.include ||= []
    nuxt.options.vite.optimizeDeps.include.push('scule')

    // Helpers are designed to be enviroment agnostic
    addImports([
      { name: 'queryCollection', from: resolver.resolve('./runtime/app') },
      { name: 'queryCollectionSearchSections', from: resolver.resolve('./runtime/app') },
      { name: 'queryCollectionNavigation', from: resolver.resolve('./runtime/app') },
      { name: 'queryCollectionItemSurroundings', from: resolver.resolve('./runtime/app') },
    ])
    addServerImports([
      { name: 'queryCollectionWithEvent', as: 'queryCollection', from: resolver.resolve('./runtime/nitro') },
      { name: 'queryCollectionSearchSectionsWithEvent', as: 'queryCollectionSearchSections', from: resolver.resolve('./runtime/nitro') },
      { name: 'queryCollectionNavigationWithEvent', as: 'queryCollectionNavigation', from: resolver.resolve('./runtime/nitro') },
      { name: 'queryCollectionItemSurroundingsWithEvent', as: 'queryCollectionItemSurroundings', from: resolver.resolve('./runtime/nitro') },
    ])
    addComponent({ name: 'ContentRenderer', filePath: resolver.resolve('./runtime/components/ContentRenderer.vue') })

    // Add Templates & aliases
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    addTypeTemplate(contentTypesTemplate(manifest.collections))
    addTemplate(fullDatabaseRawDumpTemplate(manifest))
    nuxt.options.alias['#content/components'] = addTemplate(componentsManifestTemplate(manifest)).dst
    nuxt.options.alias['#content/manifest'] = addTemplate(manifestTemplate(manifest)).dst

    // Register user components
    const _layers = [...nuxt.options._layers].reverse()
    for (const layer of _layers) {
      const path = resolver.resolve(layer.config.srcDir, 'components/content')
      const dirStat = await stat(path).catch((): null => null)
      if (dirStat && dirStat.isDirectory()) {
        nuxt.hook('components:dirs', (dirs) => {
          dirs.unshift({ path, pathPrefix: false, prefix: '' })
        })
      }
    }

    // Load nitro preset and set db adapter
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

    // Prerender database.sql routes for each collection to fetch dump
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

    // Generate collections and sql dump to update templates local database
    // `app:templates` is triggered for all environments
    nuxt.hook('app:templates', async () => {
      await dumpGeneratePromise
    })

    dumpGeneratePromise.then(async () => {
      // Handle HMR changes
      if (nuxt.options.dev) {
        addPlugin({ src: resolver.resolve('./runtime/plugins/websocket.dev'), mode: 'client' })
        await watchComponents(nuxt)
        const socket = await startSocketServer(nuxt, options, manifest)
        await watchContents(nuxt, options, manifest, socket)
      }

      // Handle preview mode
      if (process.env.NUXT_CONTENT_PREVIEW_API || options.preview?.api) {
        // Only enable preview in production build or when explicitly enabled
        if (nuxt.options.dev === true && !options.preview?.dev) {
          return
        }

        await setupPreview(options, nuxt, resolver, manifest)
      }
    })
  },
})

async function processCollectionItems(nuxt: Nuxt, collections: ResolvedCollection[], options: ModuleOptions) {
  const collectionDump: Record<string, string[]> = {}
  const collectionChecksum: Record<string, string> = {}
  const db = await getLocalDatabase(options._localDatabase!.filename)
  const databaseContents = await db.fetchDevelopmentCache()

  const configHash = hash({
    mdcHighlight: (nuxt.options as unknown as { mdc: MDCModuleOptions }).mdc?.highlight,
    contentBuild: options.build?.markdown,
  })

  const infoCollection = collections.find(c => c.name === 'info')!

  const startTime = performance.now()
  let filesCount = 0
  let cachedFilesCount = 0
  let parsedFilesCount = 0

  // Remove all existing content collections to start with a clean state
  db.dropContentTables()
  // Create database dump
  for await (const collection of collections) {
    if (collection.name === 'info') {
      continue
    }
    const collectionHash = hash(collection)
    collectionDump[collection.name] = []
    // Collection table definition
    collectionDump[collection.name]!.push(
      ...generateCollectionTableDefinition(collection, { drop: true }).split('\n'),
    )

    if (!collection.source) {
      continue
    }
    const parse = await createParser(collection, nuxt)

    for await (const source of collection.source) {
      if (source.prepare) {
        await source.prepare({ rootDir: nuxt.options.rootDir })
      }

      const { fixed } = parseSourceBase(source)
      const cwd = source.cwd
      const _keys = await source.getKeys()

      filesCount += _keys.length

      const list: Array<[string, Array<string>]> = []
      for await (const chunk of chunks(_keys, 25)) {
        await Promise.all(chunk.map(async (key) => {
          const keyInCollection = join(collection.name, source?.prefix || '', key)
          const fullPath = join(cwd, fixed, key)

          const content = await source.getItem(key)
          const checksum = getContentChecksum(configHash + collectionHash + content)
          const cache = databaseContents[keyInCollection]

          let parsedContent
          if (cache && cache.checksum === checksum) {
            cachedFilesCount += 1
            parsedContent = JSON.parse(cache.parsedContent)
          }
          else {
            parsedFilesCount += 1
            parsedContent = await parse({
              id: keyInCollection,
              body: content,
              path: fullPath,
            })
            db.insertDevelopmentCache(keyInCollection, checksum, JSON.stringify(parsedContent))
          }

          list.push([key, generateCollectionInsert(collection, parsedContent)])
        }))
      }
      // Sort by file name to ensure consistent order
      list.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      collectionDump[collection.name]!.push(...list.flatMap(([, sql]) => sql!))

      collectionChecksum[collection.name] = hash(collectionDump[collection.name])

      collectionDump[collection.name]!.push(
        generateCollectionTableDefinition(infoCollection, { drop: false }),
        `DELETE FROM ${infoCollection.tableName} WHERE id = 'checksum_${collection.name}';`,
        ...generateCollectionInsert(infoCollection, { id: `checksum_${collection.name}`, version: collectionChecksum[collection.name] }),
      )
    }
  }

  const sqlDumpList = Object.values(collectionDump).flatMap(a => a)

  // Drop info table and recreate it
  db.exec(`DROP TABLE IF EXISTS ${infoCollection.tableName}`)
  for (const sql of sqlDumpList) {
    db.exec(sql)
  }

  const tags = sqlDumpList.flatMap((sql: string): RegExpMatchArray | [] => sql.match(/(?<=(^|,|\[)\[")[^"]+(?=")/g) || [])
  const uniqueTags = [
    ...Object.values(options.renderer.alias || {}),
    ...new Set(tags),
  ]
    .map(tag => getMappedTag(tag, options?.renderer?.alias))
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

const proseTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'strong', 'em', 's', 'code', 'span', 'blockquote', 'pre', 'hr', 'img', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td']
function getMappedTag(tag: string, additionalTags: Record<string, string> = {}) {
  if (proseTags.includes(tag)) {
    return `prose-${tag}`
  }
  return additionalTags[tag] || tag
}
