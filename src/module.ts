import { mkdir } from 'node:fs/promises'
import { createStorage } from 'unstorage'
import { defineNuxtModule, createResolver, addImportsDir, addServerScanDir, addTemplate, addTypeTemplate, resolveAlias } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { transformContent } from '@nuxt/content/transformers'
import { deflate } from 'pako'
import { hash } from 'ohash'
import { chunks, getMountDriver, useContentMounts } from './utils/source'
import { addWasmSupport } from './utils/wasm'
import { resolveCollections, generateCollectionInsert } from './utils/collection'
import { collectionsTemplate, contentTypesTemplate } from './utils/templates'
import type { ResolvedCollection } from './types'

export * from './utils/collection'
export * from './utils/schema'

// Module options TypeScript interface definition
export interface ModuleOptions {
  database: 'nuxthub' | 'builtin'
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'Content',
    configKey: 'contentV3',
  },
  defaults: {
    database: 'nuxthub',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    const dataDir = nuxt.options.rootDir + '/.data/content'

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({ dir: dataDir, maxAge: 0 })

    await mkdir(dataDir, { recursive: true }).catch(() => {})

    const contentConfig = await import(nuxt.options.rootDir + '/content.config')
      .catch((err) => {
        console.error(err)
        return {}
      })

    const collections = resolveCollections(contentConfig.collections || {})

    const publicRuntimeConfig = {
      clientDB: false,
    }

    const privateRuntimeConfig = {
      integrityVersion: '0.0.1-' + hash(collections.map(c => c.table).join('-')),
      dev: {
        dataDir: dataDir,
        databaseName: 'items2.db',
      },
      db: options.database,
    }
    nuxt.options.runtimeConfig.public.contentv3 = publicRuntimeConfig
    nuxt.options.runtimeConfig.contentv3 = privateRuntimeConfig

    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
    nuxt.options.vite.optimizeDeps.exclude = nuxt.options.vite.optimizeDeps.exclude || []
    nuxt.options.vite.optimizeDeps.exclude.push('@sqlite.org/sqlite-wasm')

    addWasmSupport(nuxt)

    addTypeTemplate({
      filename: 'content/content.d.ts',
      getContents: contentTypesTemplate,
      options: { collections },
    })
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#content-v3/collections'] = addTemplate({
      filename: 'content/collections.mjs',
      getContents: collectionsTemplate,
      options: { collections },
      write: true,
    }).dst

    let dumpisReady = false
    const sqlDumpList: string[] = []
    nuxt.options.nitro.alias['#content-v3/dump'] = addTemplate({ filename: 'content/dump.mjs', getContents: () => {
      const compressed = deflate(JSON.stringify(sqlDumpList))

      const str = Buffer.from(compressed.buffer).toString('base64')
      return [
        'import { inflate } from "pako"',
        `export default function() {`,
          `return JSON.parse(inflate(new Uint8Array(Buffer.from("${str}", 'base64')), { to: 'string' }));`,
        `}`,
        `export const ready = ${dumpisReady}`,
      ].join('\n')
    }, write: true }).dst

    addImportsDir(resolver.resolve('./runtime/composables'))
    addServerScanDir(resolver.resolve('./runtime/server'))

    const dumpGeneratePromise = generateSqlDump(nuxt, collections, privateRuntimeConfig.integrityVersion).then ((dump) => {
      sqlDumpList.push(...dump)
      dumpisReady = true
    })
    nuxt.hook('app:templates', async () => {
      await dumpGeneratePromise
    })
  },
})

async function generateSqlDump(nuxt: Nuxt, collections: ResolvedCollection[], integrityVersion: string) {
  const sqlDumpList: string[] = []

  const storage = createStorage()
  const _sources = useContentMounts(nuxt, collections.map(c => c.source))
  for (const [key, source] of Object.entries(_sources)) {
    if (source.driver === 'fs' && source.base) {
      source.base = resolveAlias(source.base)
    }
    storage.mount(key, await getMountDriver(source))
  }

  // Create database dumpz
  for await (const collection of collections) {
    sqlDumpList.push(collection.table)

    const keys = await storage.getKeys(collection.name)

    for await (const chunk of chunks(keys, 25)) {
      await Promise.all(chunk.map(async (key) => {
        console.log('Processing', key)
        const content = await storage.getItem(key)
        const parsedContent = await transformContent(key, content)

        // TODO: remove this
        parsedContent.title = parsedContent.title || parsedContent._title
        parsedContent.description = parsedContent.description || parsedContent._description
        parsedContent.path = parsedContent.path || parsedContent._path
        parsedContent.stem = parsedContent.stem || parsedContent._stem
        parsedContent.body = parsedContent.body || (parsedContent._extension === 'yml' ? JSON.parse(JSON.stringify(parsedContent)) : {})

        sqlDumpList.push(generateCollectionInsert(collection, parsedContent))
      }))
    }
  }
  const infoCollection = collections.find(c => c.name === '_info')!
  sqlDumpList.push(generateCollectionInsert(infoCollection, { version: integrityVersion }))

  return sqlDumpList
}
