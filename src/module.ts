import { mkdir } from 'node:fs/promises'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { defineNuxtModule, createResolver, addImportsDir, addServerScanDir, useNitro, addTemplate } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { transformContent } from '@nuxt/content/transformers'
import { contentSchema, generateInsert, infoSchema, zodToSQL } from './runtime/sqlite'

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, nuxt) {
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

    nuxt.options.runtimeConfig.public.contentv3 = {
      clientDB: false,
    }
    nuxt.options.runtimeConfig.contentv3 = {
      integrityVersion: '0.0.1',
      dataDir,
      db: 'nuxthub',
      sources,
    }

    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
    nuxt.options.vite.optimizeDeps.exclude = nuxt.options.vite.optimizeDeps.exclude || []
    nuxt.options.vite.optimizeDeps.exclude.push('@sqlite.org/sqlite-wasm')

    addWasmSupport(nuxt)

    const sqlDumpList = []
    const { dst: _dst } = addTemplate({ filename: 'dump.mjs', getContents: () => `export default ${JSON.stringify(sqlDumpList)}`, write: true })
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#content-v3/dump.mjs'] = _dst

    addImportsDir(resolver.resolve('./runtime/composables'))

    addServerScanDir(resolver.resolve('./runtime/server'))

    // Create database dump
    sqlDumpList.push(zodToSQL(contentSchema, 'content'))
    sqlDumpList.push(zodToSQL(infoSchema, 'info'))

    const insert = generateInsert(infoSchema, 'info', { version: nuxt.options.runtimeConfig.contentv3.integrityVersion })
    sqlDumpList.push(mergeInterValues(insert.prepareSql, insert.values))
    const storage = createStorage()
    sources.forEach(source => storage.mount(`content`, fsDriver({ base: source })))
    const keys = await storage.getKeys('content')
    for await (const key of keys) {
      const content = await storage.getItem(key)
      const parsedContent = await transformContent(key, content)
      const insert = generateInsert(contentSchema, 'content', parsedContent)
      sqlDumpList.push(mergeInterValues(insert.prepareSql, insert.values))
    }
  },
})

function mergeInterValues(sql: string, values: any[]) {
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
