import fs from 'fs/promises'
import { addPluginTemplate, addTemplate, resolveModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { join, resolve } from 'pathe'
import _glob from 'glob'
import type { IOptions as GlobOptions } from 'glob'
import { resolveAppDir, resolveRuntimeDir, runtimeDir, templateDir } from '../dirs'
import { loadNuxtIgnoreList } from './utils'
import type { DocusOptions } from 'types'

// Promisified glob
const glob = (pattern: string, options: GlobOptions = {}) =>
  new Promise<string[]>((resolve, reject) =>
    _glob(pattern, options, (err, matches) => {
      if (err) return reject(err)
      resolve(matches)
    })
  )

export const setupAppModule = (nuxt: Nuxt, options: DocusOptions) => {
  // @ts-ignore
  loadNuxtIgnoreList(nuxt).then(ignoreList => (options.ignoreList = ignoreList))

  // Setup runtime aliases
  nuxt.options.alias['#docus$'] = runtimeDir
  nuxt.options.alias['#docus/composables'] = resolveAppDir('composables')
  nuxt.options.alias['#docus/database'] = resolveRuntimeDir('database/providers', options.database.provider)

  // Get cache dir for Docus inside project rootDir
  nuxt.options.alias['#docus/cache'] = join(nuxt.options.rootDir, 'node_modules/.cache/docus')

  // Initialize meta
  nuxt.options.meta = nuxt.options.meta || {}

  // Initialize head
  nuxt.options.head = nuxt.options.head || {}

  // Initialize head meta
  nuxt.options.head.meta = nuxt.options.head.meta || []

  // Push meta to head meta
  nuxt.options.head.meta.push(
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  )

  // Set bridge config
  nuxt.options.bridge = nuxt.options.bridge || {}
  nuxt.options.bridge.autoImports = false
  nuxt.options.bridge.postcss8 = true

  // Inject components
  nuxt.options.components = Array.isArray(nuxt.options.components) ? nuxt.options.components : []
  nuxt.options.components.push({
    path: resolveAppDir('components'),
    isAsync: false,
    prefix: '',
    level: 999
  })

  // Init color mode
  // Docs: https://color-mode.nuxtjs.org
  nuxt.options.colorMode = nuxt.options.colorMode || {}
  nuxt.options.colorMode.classSuffix = ''

  // Init image module
  nuxt.options.image = nuxt.options.image || {}
  nuxt.options.image.domains = nuxt.options.image.domains || []
  nuxt.options.image.domains.push('https://i3.ytimg.com')

  // Set server configuration
  nuxt.options.target = 'server'
  nuxt.options.server = nuxt.options.server || {}
  nuxt.options.server.port = parseInt(process.env.PORT || '4000', 10)

  // Set generate configuration
  nuxt.options.generate = nuxt.options.generate || {}
  nuxt.options.generate.routes = nuxt.options.generate.routes || []
  nuxt.options.generate.fallback = '404.html'
  nuxt.options.generate.routes.push('/')

  // Set Nitro configuration
  nuxt.options.nitro = nuxt.options.nitro || {}
  nuxt.options.nitro.experiments = nuxt.options.nitro.experiments || {}
  nuxt.options.nitro.experiments.wasm = true
  nuxt.options.nitro.inlineDynamicImports = true
  nuxt.options.nitro.externals =
    process.env.NITRO_PRESET === 'cloudflare'
      ? false
      : {
          inline: ['docus', 'ohmyfetch', 'property-information', '@docus/mdc', '@docus/remark-mdc'],
          external: [
            'vue-docgen-api',
            '@nuxt/kit',
            '@nuxt/image',
            '@nuxtjs/i18n',
            'vue-meta',
            'vue-router',
            'vue-i18n',
            'ufo',
            'vue-client-only',
            'vue-no-ssr',
            'ohmyfetch'
          ]
        }

  // Set build configuration
  nuxt.options.build = nuxt.options.build || {}
  nuxt.options.build.transpile = nuxt.options.build.transpile || []
  nuxt.options.build.transpile.push('@docus/', 'ohmyfetch', 'property-information', 'nuxt-component-meta', 'docus')

  // Setup default layout
  nuxt.options.layouts.default = resolveAppDir('layouts/default.vue')

  // Extend `/` route
  nuxt.hook('build:extendRoutes', (routes: any[]) => {
    const hasRoute = (name: string) => routes.some(route => route.name === name)

    if (!hasRoute('all')) {
      routes.push({
        path: '/*',
        name: 'all',
        component: resolveAppDir('pages/_.vue')
      })
    }
  })

  nuxt.hook('build:before', async () => {
    // Add default error page if not defined
    const errorPagePath = resolve(nuxt.options.srcDir, nuxt.options.dir.layouts, 'error.vue')
    const errorPageExists = await fs.stat(errorPagePath).catch(() => false)
    if (!errorPageExists) nuxt.options.ErrorPage = nuxt.options.ErrorPage || resolveAppDir('layouts/error.vue')

    // If pages/ does not exists, disable Nuxt pages parser (to avoid warning) and watch pages/ creation for full restart
    // To support older version of Nuxt
    const pagesDirPath = resolve(nuxt.options.srcDir, nuxt.options.dir.pages)
    const pagesDirExists = await fs.stat(pagesDirPath).catch(() => false)
    if (!pagesDirExists) {
      // @ts-ignore
      nuxt.options.build.createRoutes = () => []
      nuxt.options.watch.push(pagesDirPath)
    }
  })

  // Recursively import all components from user project
  nuxt.hook('components:dirs', async (dirs: any) => {
    // Get the user root `components` folder
    // TODO: This should be done via nuxt-extend
    const componentsDirPath = resolve(nuxt.options.rootDir, 'components')
    const componentsDirStat = await fs.stat(componentsDirPath).catch(() => null)

    if (componentsDirStat && componentsDirStat.isDirectory()) {
      // Register the root `components` directory
      dirs.push({
        path: componentsDirPath,
        isAsync: false
      })

      // Check for sub directories
      const subDirs = await glob(componentsDirPath + '/**/')

      // Register each subdirectories
      subDirs.forEach((path: string) => dirs.push({ path, isAsync: false }))
    } else {
      // Watch existence of root `components` directory
      nuxt.options.watch.push(componentsDirPath)
    }
  })

  // Add Docus context template
  addTemplate({
    src: resolveModule('./options', { paths: templateDir }),
    filename: 'docus/options.mjs',
    options
  })

  // Add Docus runtime plugin
  addPluginTemplate(
    {
      src: resolveModule('./docus', { paths: templateDir })
    },
    {
      append: true
    }
  )

  // @ts-ignore - Call docus:context hook
  nuxt.hook('modules:done', () => nuxt.callHook('docus:options', options))
}
