import { resolve } from 'path'
import { Module } from '@nuxt/types'

const r = (...args: any[]) => resolve(__dirname, ...args)

export default <Module>function docusAppModule() {
  const { nuxt, addPlugin } = this

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

  addPlugin({
    src: resolve(__dirname, '../../templates/plugin.js'),
    filename: 'docus/index.js'
  })
}
