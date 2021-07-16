import gracefulFs from 'graceful-fs'
import { resolve } from 'upath'
import { Module } from '@nuxt/types'

const r = (...args: any[]) => resolve(__dirname, ...args)

const fs = gracefulFs.promises

export default <Module>function docusAppModule() {
  const { nuxt, addPlugin, options } = this

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

  // If pages/ does not exists, disable Nuxt pages parser (to avoid warning) and watch pages/ creation for full restart
  nuxt.hook('build:before', async () => {
    // To support older version of Nuxt
    const pagesDirPath = resolve(options.srcDir, options.dir.pages)
    const pagesDirExists = await fs.stat(pagesDirPath).catch(() => false)
    if (!pagesDirExists) {
      // @ts-ignore
      options.build.createRoutes = () => []
      options.watch.push(pagesDirPath)
    }
  })

  // Add Docus plugin
  addPlugin({
    src: r('plugin.js'),
    filename: 'docus/index.js'
  })
}
