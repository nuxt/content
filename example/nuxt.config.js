const { resolve } = require('path')
const contentModule = require('..')

module.exports = {
  rootDir: resolve(__dirname, '..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  modules: [
    contentModule
  ],
  content: {
    nestedProperties: [
      'categories.slug'
    ]
  }
}
