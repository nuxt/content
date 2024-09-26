import { mkdir, readFile } from 'node:fs/promises'
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

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'Content',
    configKey: 'contentV3',
  },
  defaults: {
    database: {
      type: 'sqlite',
      filename: '.data/content/local.db',
    },
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    await mkdir(join(nuxt.options.rootDir, '.data/content'), { recursive: true }).catch(() => {})
    const localDatabase = join(nuxt.options.rootDir, '.data/content/local.db')

    if (options.database.type === 'sqlite') {
      options.database.filename = join(nuxt.options.rootDir, options.database.filename)
      await mkdir(dirname(options.database.filename), { recursive: true }).catch(() => {})
    }

    const { collections } = await loadContentConfig(nuxt.options.rootDir, { createOnMissing: true })

    const integrityVersion = '0.0.2-' + hash(collections.map(c => c.table).join('-'))

    const publicRuntimeConfig = {
      integrityVersion,
    }

    const privateRuntimeConfig = {
      integrityVersion,
      database: options.database,
      localDatabase: { type: 'sqlite', filename: localDatabase } as SqliteDatabaseConfig,
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

    // Install mdc module
    await installModule('@nuxtjs/mdc')

    if (nuxt.options._prepare) {
      return
    }

    const dumpGeneratePromise = generateSqlDump(nuxt, collections, localDatabase, privateRuntimeConfig.integrityVersion)
      .then((dump) => {
        sqlDump = dump
      })

    nuxt.hook('app:templates', async () => {
      await dumpGeneratePromise
    })

    if (nuxt.options.dev) {
      watchContents(nuxt, collections, localDatabase)

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

async function generateSqlDump(nuxt: Nuxt, collections: ResolvedCollection[], cachelocalDatabase: string, integrityVersion: string) {
  const sqlDumpList: string[] = []
  const db = localDatabase(cachelocalDatabase)
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
