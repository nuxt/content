const { resolve } = require('path')
const contentModule = require('..')

module.exports = {
  rootDir: resolve(__dirname, '..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  modules: [
    contentModule
  ],
  plugins: [
    '~/plugins/components'
  ],
  content: {
    nestedProperties: [
      'categories.slug'
    ]
  }
}
