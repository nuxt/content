const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  modules: [
    require('../')
  ],
  buildModules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/moment'
  ]
}
