import { mkdir, readFile } from 'node:fs/promises'
import { defineNuxtModule, createResolver, addTemplate, addTypeTemplate, addImports, addServerImports, addServerHandler, installModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { deflate } from 'pako'
import { hash } from 'ohash'
import { join } from 'pathe'
import fastGlob from 'fast-glob'
import { generateCollectionInsert, parseSourceBase } from './utils/collection'
import { collectionsTemplate, contentTypesTemplate } from './utils/templates'
import type { ResolvedCollection } from './types/collection'
import type { ModuleOptions } from './types/module'
import { getContentChecksum, localDatabase, logger, watchContents, chunks } from './utils/dev'
import { loadContentConfig } from './utils/config'
import { parseContent } from './utils/content'

export * from './utils/collection'
export * from './utils/schema'
export type * from './types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'Content',
    configKey: 'contentV3',
  },
  defaults: {
    database: 'builtin',
    dev: {
      dataDir: '.data/content',
      databaseName: 'items.db',
    },
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    options.dev!.dataDir = join(nuxt.options.rootDir, options.dev!.dataDir!)
    await mkdir(options.dev!.dataDir, { recursive: true }).catch(() => {})
    const databaseLocation = join(options.dev!.dataDir, options.dev!.databaseName!)

    const { collections } = await loadContentConfig(nuxt, { createOnMissing: true })

    const integrityVersion = '0.0.1-' + hash(collections.map(c => c.table).join('-'))

    const publicRuntimeConfig = {
      integrityVersion,
    }

    const privateRuntimeConfig = {
      integrityVersion,
      dev: options.dev,
      db: options.database,
    }
    nuxt.options.runtimeConfig.public.contentv3 = publicRuntimeConfig
    nuxt.options.runtimeConfig.contentv3 = privateRuntimeConfig

    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
    nuxt.options.vite.optimizeDeps.exclude = nuxt.options.vite.optimizeDeps.exclude || []
    nuxt.options.vite.optimizeDeps.exclude.push('@sqlite.org/sqlite-wasm')

    nuxt.options.routeRules ||= {}
    nuxt.options.routeRules['/api/database'] = { prerender: true }

    addServerHandler({ route: '/api/database', handler: resolver.resolve('./runtime/server/api/database') })
    addServerHandler({ route: '/api/database-decompress', handler: resolver.resolve('./runtime/server/api/database-decompress') })
    // addServerHandler({ handler: resolver.resolve('./runtime/server/middleware/coop'), middleware: true })

    addImports([
      { name: 'queryCollection', from: resolver.resolve('./runtime/utils/queryCollection') },
      { name: 'getCollectionNavigation', from: resolver.resolve('./runtime/utils/getCollectionNavigation') },
      { name: 'getSurroundingCollectionItems', from: resolver.resolve('./runtime/utils/getSurroundingCollectionItems') },
      { name: 'queryContentV3', from: resolver.resolve('./runtime/composables/queryContentV3') },
    ])

    addServerImports([
      { name: 'queryCollection', from: resolver.resolve('./runtime/utils/queryCollection') },
      { name: 'getCollectionNavigation', from: resolver.resolve('./runtime/utils/getCollectionNavigation') },
      { name: 'getSurroundingCollectionItems', from: resolver.resolve('./runtime/utils/getCollectionNavigation') },
    ])

    addServerHandler({ route: '/api/:collection/query', handler: resolver.resolve('./runtime/server/api/[collection]/query.post'), method: 'post' })

    // Types template
    addTypeTemplate({ filename: 'content/content.d.ts', getContents: contentTypesTemplate, options: { collections } })

    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#content-v3/collections'] = addTemplate({
      filename: 'content/collections.mjs',
      getContents: collectionsTemplate,
      options: { collections },
      write: true,
    }).dst

    let sqlDump: string[] = []
    nuxt.options.nitro.alias['#content-v3/dump'] = addTemplate({ filename: 'content/dump.mjs', getContents: () => {
      const compressed = deflate(JSON.stringify(sqlDump))

      const str = Buffer.from(compressed.buffer).toString('base64')
      return `export default "${str}"`
    }, write: true }).dst

    // Install mdc module
    await installModule('@nuxtjs/mdc')

    if (nuxt.options._prepare) {
      return
    }

    const dumpGeneratePromise = generateSqlDump(nuxt, collections, databaseLocation, privateRuntimeConfig.integrityVersion)
      .then((dump) => {
        sqlDump = dump
      })

    nuxt.hook('app:templates', async () => {
      await dumpGeneratePromise
    })

    if (nuxt.options.dev) {
      watchContents(nuxt, collections, databaseLocation)

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

async function generateSqlDump(nuxt: Nuxt, collections: ResolvedCollection[], cacheDatabaseLocation: string, integrityVersion: string) {
  const sqlDumpList: string[] = []
  const db = localDatabase(cacheDatabaseLocation)
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

    const _keys = await fastGlob(dynamic, { cwd, ignore: collection.source!.ignore || [] })
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
          parsedContent = await parseContent(keyInCollection, content, collection)
          db.insertDevelopmentCache(keyInCollection, checksum, JSON.stringify(parsedContent))
        }

        sqlDumpList.push(generateCollectionInsert(collection, parsedContent))
      }))
    }
  }

  const infoCollection = collections.find(c => c.name === '_info')!
  sqlDumpList.push(generateCollectionInsert(infoCollection, { id: 'version', version: integrityVersion }))

  for (const sql of sqlDumpList) {
    db.exec(sql)
  }

  const endTime = performance.now()
  logger.success(`Processed ${collections.length} collections and ${filesCount} files in ${(endTime - startTime).toFixed(2)}ms (${cachedFilesCount} cached, ${parsedFilesCount} parsed)`)

  return sqlDumpList
}
