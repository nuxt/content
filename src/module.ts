import { mkdir } from 'node:fs/promises'
import { createStorage } from 'unstorage'
import { defineNuxtModule, createResolver, addImportsDir, addServerScanDir, useNitro, addTemplate } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { transformContent } from '@nuxt/content/transformers'
import { deflate } from 'pako'
import { contentSchema, generateInsert, infoSchema, zodToSQL } from './runtime/sqlite'
import { chunks, getMountDriver, useContentMounts } from './utils'

export type MountOptions = {
  driver: 'fs' | 'http' | string
  name?: string
  prefix?: string
  [options: string]: any
}

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Contents can be located in multiple places, in multiple directories or even in remote git repositories.
   * Using sources option you can tell Content module where to look for contents.
   *
   * @default ['content']
   */
  sources: Record<string, MountOptions>

  database: 'nuxthub' | 'builtin'
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'Content',
    configKey: 'contentV3',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    sources: {},
    database: 'nuxthub',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    const dataDir = nuxt.options.rootDir + '/.data/content'

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({ dir: dataDir, maxAge: 0 })

    try {
      await mkdir(dataDir, { recursive: true })
    }
    catch (error) {
      console.error(error)
    }
    const sources = [
      nuxt.options.rootDir + '/content',
    ]

    const publicRuntimeConfig = {
      clientDB: false,
    }
    const privateRuntimeConfig = {
      integrityVersion: '0.0.1',
      dev: {
        dataDir: dataDir,
        databaseName: 'items2.db',
      },
      db: options.database,
      sources,
    }
    nuxt.options.runtimeConfig.public.contentv3 = publicRuntimeConfig
    nuxt.options.runtimeConfig.contentv3 = privateRuntimeConfig

    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
    nuxt.options.vite.optimizeDeps.exclude = nuxt.options.vite.optimizeDeps.exclude || []
    nuxt.options.vite.optimizeDeps.exclude.push('@sqlite.org/sqlite-wasm')

    addWasmSupport(nuxt)

    let dumpisReady = false
    const sqlDumpList: string[] = []
    const { dst: _dst } = addTemplate({ filename: 'dump.mjs', getContents: () => {
      const compressed = deflate(JSON.stringify(sqlDumpList))
      const str = Buffer.from(compressed.buffer).toString('base64')
      return [
        'import { inflate } from "pako"',

        `export default function() {`,
          `return JSON.parse(inflate(new Uint8Array(Buffer.from("${str}", 'base64')), { to: 'string' }));`,
        `}`,
        `export const ready = ${dumpisReady}`,
      ].join('\n')
    }, write: true })
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#content-v3/dump.mjs'] = _dst

    addImportsDir(resolver.resolve('./runtime/composables'))

    addServerScanDir(resolver.resolve('./runtime/server'))

    generateSqlDump(nuxt, options, privateRuntimeConfig.integrityVersion).then ((dump) => {
      sqlDumpList.push(...dump)
      dumpisReady = true
    })
  },
})

async function generateSqlDump(nuxt: Nuxt, options: ModuleOptions, integrityVersion: string) {
  const sqlDumpList: string[] = []

  // Create database dump
  sqlDumpList.push(zodToSQL(contentSchema, 'content'))

  const storage = createStorage()
  const _sources = useContentMounts(nuxt, options.sources)
  for (const [key, source] of Object.entries(_sources)) {
    storage.mount(key, await getMountDriver(source))
  }
  const keys = await storage.getKeys('content')
  // chunk 25 keys

  for await (const chunk of chunks(keys, 25)) {
    await Promise.all(chunk.map(async (key) => {
      console.log('Processing', key)
      const content = await storage.getItem(key)
      const parsedContent = await transformContent(key.replace(/^content:/, ''), content)
      if (parsedContent._extension === 'yml') {
        parsedContent.body = JSON.parse(JSON.stringify(parsedContent))
      }
      const insert2 = generateInsert(contentSchema, 'content', parsedContent)
      sqlDumpList.push(mergeInterValues(insert2.prepareSql, insert2.values))
    }))
  }

  console.log('Generating info table')
  sqlDumpList.push(zodToSQL(infoSchema, 'info'))
  const insert = generateInsert(infoSchema, 'info', { version: integrityVersion })
  sqlDumpList.push(mergeInterValues(insert.prepareSql, insert.values))

  return sqlDumpList
}

function mergeInterValues(sql: string, values: Array<string | number | boolean | object>) {
  let index = 0
  return sql.replace(/\?/g, () => {
    const value = values[index++]
    switch (typeof value) {
      case 'string':
        return `'${value.replace(/'/g, '\'\'')}'`
      case 'number':
        return `${value}`
      case 'boolean':
        return value ? '1' : '0'
      default:
        return `'${JSON.stringify(value)}'`
    }
  })
}

export function addWasmSupport(nuxt: Nuxt) {
  nuxt.hook('ready', () => {
    const nitro = useNitro()
    const _addWasmSupport = (_nitro: typeof nitro) => {
      if (nitro.options.experimental?.wasm) {
        return
      }
      _nitro.options.externals = _nitro.options.externals || {}
      _nitro.options.externals.inline = _nitro.options.externals.inline || []
      _nitro.options.externals.inline.push(id => id.endsWith('.wasm'))
      _nitro.hooks.hook('rollup:before', async (_, rollupConfig) => {
        const { rollup: unwasm } = await import('unwasm/plugin')
        rollupConfig.plugins = rollupConfig.plugins || []
        ;(rollupConfig.plugins as any[]).push(
          unwasm({
            ...(_nitro.options.wasm as any),
          }),
        )
      })
    }
    _addWasmSupport(nitro)
    nitro.hooks.hook('prerender:init', (prerenderer) => {
      _addWasmSupport(prerenderer)
    })
  })
}
