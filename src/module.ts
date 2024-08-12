import { mkdir } from 'node:fs/promises'
import { createStorage } from 'unstorage'
import { defineNuxtModule, createResolver, addImportsDir, addServerScanDir, addTemplate, addTypeTemplate, resolveAlias, addImports, addServerImports } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { transformContent } from '@nuxt/content/transformers'
import { deflate } from 'pako'
import { hash } from 'ohash'
import { chunks, getMountDriver, generateStorageMountOptions } from './utils/source'
import type { MountOptions } from './types/source'
import { addWasmSupport } from './utils/wasm'
import { resolveCollections, generateCollectionInsert } from './utils/collection'
import { collectionsTemplate, contentTypesTemplate } from './utils/templates'
import type { ResolvedCollection } from './types/collection'
import type { ModuleOptions } from './types/module'

export * from './utils/collection'
export * from './utils/schema'
export type * from './types'

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
        dataDir,
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

    let dumpIsReady = false
    let sqlDump: string[] = []
    nuxt.options.nitro.alias['#content-v3/dump'] = addTemplate({ filename: 'content/dump.mjs', getContents: () => {
      const compressed = deflate(JSON.stringify(sqlDump))

      const str = Buffer.from(compressed.buffer).toString('base64')
      return [
        'import { inflate } from "pako"',
        `export default function() {`,
          `return JSON.parse(inflate(new Uint8Array(Buffer.from("${str}", 'base64')), { to: 'string' }));`,
        `}`,
        `export const ready = ${dumpIsReady}`,
      ].join('\n')
    }, write: true }).dst

    addImportsDir(resolver.resolve('./runtime/composables'))
    addServerScanDir(resolver.resolve('./runtime/server'))
    addImports([
      { name: 'queryContents', from: resolver.resolve('./runtime/utils/queryContents') },
    ])
    addServerImports([
      { name: 'queryContents', from: resolver.resolve('./runtime/utils/queryContents') },
    ])

    const dumpGeneratePromise = generateSqlDump(nuxt, collections, privateRuntimeConfig.integrityVersion).then((dump) => {
      sqlDump = dump
      dumpIsReady = true
    })

    nuxt.hook('app:templates', async () => {
      await dumpGeneratePromise
    })
  },
})

async function generateSqlDump(nuxt: Nuxt, collections: ResolvedCollection[], integrityVersion: string) {
  const sqlDumpList: string[] = []

  const storage = createStorage()
  const mountsOptions = generateStorageMountOptions(nuxt, collections.map(c => c.source) as MountOptions[])
  for (const [key, options] of Object.entries(mountsOptions)) {
    if (options.driver === 'fs' && options.base) {
      options.base = resolveAlias(options.base)
    }
    storage.mount(key, await getMountDriver(options))
  }

  // Create database dump
  for await (const collection of collections) {
    // Collection table definition
    sqlDumpList.push(collection.table)

    // Insert content
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
