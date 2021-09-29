import gracefulFs from 'graceful-fs'
import { addPluginTemplate } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/kit'
import { join, resolve } from 'pathe'
import _glob from 'glob'
import type { IOptions as GlobOptions } from 'glob'
import { resolveAppDir, resolveTemplateDir } from './dirs'

// Use gracefulFs promises instead of `fs` imports
const fs = gracefulFs.promises

// Promisified glob
const glob = (pattern: string, options: GlobOptions = {}) =>
  new Promise<string[]>((resolve, reject) =>
    _glob(pattern, options, (err, matches) => {
      if (err) return reject(err)
      resolve(matches)
    })
  )

export const setupAppModule = (nuxt: Nuxt) => {
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

  // Get cache dir for Docus inside project rootDir
  const cacheDir = join(nuxt.options.rootDir, 'node_modules/.cache/docus')
  nuxt.options.alias['#docus-cache'] = cacheDir

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
    const componentsDirStat = await gracefulFs.promises.stat(componentsDirPath).catch(() => null)

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

  // Add Docus runtime plugin
  addPluginTemplate(
    {
      src: resolveTemplateDir('docus.js'),
      options: {
        hasDocusConfig: nuxt.options.hasDocusConfig,
        hasTheme: nuxt.options.hasTheme,
        hasThemeConfig: nuxt.options.hasThemeConfig
      }
    },
    {
      append: true
    }
  )

  // Inject store plugins
  addPluginTemplate({
    src: resolveTemplateDir('store.js')
  })

  // TODO: Remove when adding bridge
  nuxt.hook('webpack:config', configs => {
    for (const config of configs.filter(c => c.module)) {
      for (const rule of config.module!.rules) {
        // @ts-ignore
        if (rule.test instanceof RegExp && rule.test.test('index.mjs')) {
          // @ts-ignore
          rule.type = 'javascript/auto'
        }
      }
    }
  })

  // Add Devtools integration (WIP)
  // if (nuxt.options.dev) addPlugin(r('../devtools'), { append: true })
}
