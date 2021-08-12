import gracefulFs from 'graceful-fs'
import { resolve } from 'upath'
import { Module } from '@nuxt/types'
import _glob from 'glob'
import type { IOptions as GlobOptions } from 'glob'

// Resolve from dirname
const r = (...args: any[]) => resolve(__dirname, ...args)

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

export default <Module>function docusAppModule() {
  const { nuxt, addPlugin, options } = this

  // Setup default layout
  nuxt.options.layouts.default = r('layouts/default.vue')

  // Extend `/` route
  nuxt.hook('build:extendRoutes', (routes: any[]) => {
    const hasRoute = (name: string) => routes.some(route => route.name === name)

    if (!hasRoute('all')) {
      routes.push({
        path: '/*',
        name: 'all',
        component: r('pages/_.vue')
      })
    }
  })

  nuxt.hook('build:before', async () => {
    // Add default error page if not defined
    const errorPagePath = resolve(options.srcDir, options.dir.layouts, 'error.vue')
    const errorPageExists = await fs.stat(errorPagePath).catch(() => false)
    if (!errorPageExists) options.ErrorPage = options.ErrorPage || r('layouts/error.vue')

    // If pages/ does not exists, disable Nuxt pages parser (to avoid warning) and watch pages/ creation for full restart
    // To support older version of Nuxt
    const pagesDirPath = resolve(options.srcDir, options.dir.pages)
    const pagesDirExists = await fs.stat(pagesDirPath).catch(() => false)
    if (!pagesDirExists) {
      // @ts-ignore
      options.build.createRoutes = () => []
      options.watch.push(pagesDirPath)
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
      options.watch.push(componentsDirPath)
    }
  })

  // Add Docus runtime plugin
  addPlugin({
    src: r('../templates/docus.js'),
    filename: 'docus/index.js'
  })
}
