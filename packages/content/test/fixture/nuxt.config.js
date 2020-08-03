const { resolve } = require('path')
const contentModule = require('@nuxt/content')

module.exports = {
  rootDir: resolve(__dirname, '../..'),
  srcDir: __dirname,
  modules: [
    contentModule
  ]
}
