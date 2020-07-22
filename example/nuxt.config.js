const { resolve } = require('path')
const contentModule = require('..')

module.exports = {
  rootDir: resolve(__dirname, '..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  modules: [
    contentModule
  ],
  components: true,
  content: {
    nestedProperties: [
      'categories.slug'
    ],
    extendParser: {
      '.custom': file => body => body.split('\n').map(line => line.trim())
    }
  }
}
