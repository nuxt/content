import { mkdir, readFile, stat } from 'node:fs/promises'
import { dirname } from 'node:path'
import { defineNuxtModule, createResolver, addTemplate, addTypeTemplate, addImports, addServerImports, addServerHandler, installModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { deflate } from 'pako'
import { hash } from 'ohash'
import { join } from 'pathe'
import fastGlob from 'fast-glob'
import { generateCollectionInsert, parseSourceBase } from './utils/collection'
import { collectionsTemplate, contentTypesTemplate } from './utils/templates'
import type { ResolvedCollection } from './types/collection'
import type { ModuleOptions, SqliteDatabaseConfig } from './types/module'
import { getContentChecksum, localDatabase, logger, watchContents, chunks } from './utils/dev'
import { loadContentConfig } from './utils/config'
import { parseContent } from './utils/content'

// Export public utils
export * from './utils'
export type * from './types'

const PROSE_TAGS = [
  'p',
  'a',
  'blockquote',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'ul',
  'ol',
  'li',
  'strong',
  'table',
  'thead',
  'tbody',
  'td',
  'th',
  'tr',
]

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'Content',
    configKey: 'contentV3',
  },
  defaults: {
    _iv: '1',
    _localDatabase: {
      type: 'sqlite',
      filename: '.data/content/local.db',
    },
    database: {
      type: 'sqlite',
      filename: '.data/content/local.db',
    },
    renderer: {
      alias: {
        ...Object.fromEntries(PROSE_TAGS.map(t => [t, `prose-${t}`])),
      },
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
    const contentOptions = {
      ..._options,
      _iv: '1',
    }

    await mkdir(join(nuxt.options.rootDir, dirname(contentOptions._localDatabase!.filename)), { recursive: true }).catch(() => {})
    contentOptions._localDatabase!.filename = join(nuxt.options.rootDir, contentOptions._localDatabase!.filename)

    if ((contentOptions.database as SqliteDatabaseConfig).filename) {
      (contentOptions.database as SqliteDatabaseConfig).filename = join(nuxt.options.rootDir, (contentOptions.database as SqliteDatabaseConfig).filename)
      await mkdir(dirname((contentOptions.database as SqliteDatabaseConfig).filename), { recursive: true }).catch(() => {})
    }

    const { collections } = await loadContentConfig(nuxt.options.rootDir, { createOnMissing: true })

    contentOptions._iv += hash({
      collections: collections.map(c => c.table),
      buildOptions: contentOptions.build,
    })

    const publicRuntimeConfig = {
      integrityVersion: contentOptions._iv,
    }

    const privateRuntimeConfig = {
      integrityVersion: contentOptions._iv,
      database: contentOptions.database,
      localDatabase: contentOptions._localDatabase!,
    }
    nuxt.options.runtimeConfig.public.contentv3 = publicRuntimeConfig
    // @ts-expect-error - privateRuntimeConfig is not typed
    nuxt.options.runtimeConfig.contentv3 = privateRuntimeConfig

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
      { name: 'getCollectionSearchSections', from: resolver.resolve('./runtime/utils/getCollectionSearchSections') },
      { name: 'getCollectionNavigation', from: resolver.resolve('./runtime/utils/getCollectionNavigation') },
      { name: 'getCollectionItemSurroundings', from: resolver.resolve('./runtime/utils/getCollectionItemSurroundings') },
    ]
    addImports(autoImports)
    addServerImports(autoImports)

    // Types template
    addTypeTemplate({ filename: 'content/types.d.ts', getContents: contentTypesTemplate, options: { collections } })

    const collectionsDst = addTemplate({
      filename: 'content/collections.mjs',
      getContents: collectionsTemplate,
      options: { collections },
      write: true,
    }).dst

    let sqlDump: string[] = []
    const dumpDst = addTemplate({ filename: 'content/dump.mjs', getContents: () => {
      const compressed = deflate(JSON.stringify(sqlDump))

      const str = Buffer.from(compressed.buffer).toString('base64')
      return `export default "${str}"`
    }, write: true }).dst

    // Add aliases
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#content-v3/collections'] = collectionsDst
    nuxt.options.nitro.alias['#content-v3/dump'] = dumpDst

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
    const nuxtMDCOptions = {
      highlight: contentOptions.build?.markdown?.highlight,
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

    if (nuxt.options._prepare) {
      return
    }

    const dumpGeneratePromise = generateSqlDump(nuxt, collections, contentOptions)
      .then((dump) => {
        sqlDump = dump
      })

    nuxt.hook('app:templates', async () => {
      await dumpGeneratePromise
    })

    if (nuxt.options.dev) {
      watchContents(nuxt, collections, contentOptions)

      nuxt.hook('nitro:init', async (nitro) => {
        nitro.storage.watch(async (_event, key) => {
          if (['root:content.config.ts', 'root:content.config.mjs'].includes(key)) {
            logger.info(`${key.split(':').pop()} Updated. Restarting Nuxt...`)

            nuxt.hooks.callHook('restart', { hard: true })
          }
        })
      })
    }
  },
})

async function generateSqlDump(nuxt: Nuxt, collections: ResolvedCollection[], options: ModuleOptions) {
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
    sqlDumpList.push(`DROP TABLE IF EXISTS ${collection.name};`)
    sqlDumpList.push(collection.table)

    if (!collection.source) {
      continue
    }

    const { fixed, dynamic } = parseSourceBase(collection.source)
    const cwd = join(nuxt.options.rootDir, 'content', fixed)

    const _keys = await fastGlob(dynamic, { cwd, ignore: collection.source!.ignore || [] }).catch(() => [])

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

  sqlDumpList.push(generateCollectionInsert(infoCollection, { id: 'version', version: options._iv }))

  for (const sql of sqlDumpList) {
    db.exec(sql)
  }

  const endTime = performance.now()
  logger.success(`Processed ${collections.length} collections and ${filesCount} files in ${(endTime - startTime).toFixed(2)}ms (${cachedFilesCount} cached, ${parsedFilesCount} parsed)`)

  return sqlDumpList
}
