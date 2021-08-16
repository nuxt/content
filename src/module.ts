import { IncomingMessage } from 'http'
import { defineNuxtModule, addPlugin } from '@nuxt/kit'
import { join, resolve } from 'upath'
import fsDriver from 'unstorage/drivers/fs'
import memoryDriver from 'unstorage/drivers/memory'
import { DocusOptions } from './types'
import { setDatabaseProvider } from './runtime/database'
import { createLokiJsDatabase } from './runtime/database/providers/lokijs'
import { createServerMiddleware } from './server/compat'
import { getDatabase } from './server/content'
import apiGet from './server/api/get'
import apiList from './server/api/list'
import { useNuxtIgnoreList } from './utils/ignore'
import { mount } from './storage'
import { useDocusContext } from './context'
import { updateNavigation } from './navigation'
import { processContext } from './transformers/markdown/utils'
import setupTarget from './target'

export default defineNuxtModule(nuxt => ({
  defaults: {
    apiBase: '_docus',
    watch: nuxt.options.dev,
    database: {
      provider: 'lokijs'
    },
    _isSSG:
      nuxt.options.dev === false &&
      (nuxt.options.target === 'static' || nuxt.options._generate || nuxt.options.mode === 'spa'),
    _dbPath: ''
  },
  async setup(options: DocusOptions, nuxt) {
    // setup runtime alias
    nuxt.options.alias['~docus-core'] = join(__dirname, 'runtime')

    // Set database provider
    setDatabaseProvider(createLokiJsDatabase('docus'))

    // Register api
    createServerMiddleware(options, nuxt)

    // setup for specifig target (`dev`, `static`)
    setupTarget(options, nuxt)

    // Add Docus runtime plugin
    addPlugin({
      src: resolve(__dirname, './templates/plugin.js'),
      filename: 'docus/core.js',
      options: {
        apiBase: options.apiBase,
        watch: options.watch,
        isSSG: options._isSSG,
        provider: options.database.provider,
        dbPath: options._dbPath
      }
    })

    // mount contents folder
    mount(
      'content',
      fsDriver({
        base: resolve(nuxt.options.srcDir, 'content'),
        // TODO: handle ignore list
        // List of Nuxt ignore rules
        ignore: await useNuxtIgnoreList(nuxt)
      })
    )
    mount('data', memoryDriver())

    let indexJob: any
    nuxt.hook('build:before', () => {
      indexJob = updateNavigation(nuxt)
    })
    nuxt.hook('build:done', async () => {
      await indexJob
    })

    nuxt.hook('modules:done', () => {
      // Extend context
      const context = useDocusContext()!
      // TODO: possibly move to @docus/app
      const codes = nuxt.options.i18n?.locales.map((locale: any) => locale.code || locale)
      context.locales.codes = codes || context.locales.codes
      context.locales.defaultLocale = nuxt.options.i18n?.defaultLocale || context.locales.defaultLocale

      nuxt.callHook('docus:context', context)

      // Process/Cleanup context after augmention
      processContext(context)
    })

    /**
     * Register components
     **/
    nuxt.hook('components:dirs', dirs => {
      dirs.push({
        path: resolve(__dirname, 'runtime/components'),
        prefix: '',
        isAsync: false,
        level: 100
      })

      // Update context: component dirs
      const context = useDocusContext()!
      context.dir.components.push(
        ...dirs.map((dir: any) => {
          if (typeof dir === 'string') return dir
          if (typeof dir === 'object') return dir.path
          return ''
        })
      )
    })

    // This will be removed once we use Nitro
    nuxt.hook('vue-renderer:context', async (ssrContext: any) => {
      ssrContext.docus = ssrContext.docus || {}
      const db = await getDatabase()

      ssrContext.docus.content = {
        get: (id: string) => apiGet({ url: id } as IncomingMessage),
        list: (id: string) => apiList({ url: id } as IncomingMessage),
        search: db?.query
      }
    })
  }
}))
