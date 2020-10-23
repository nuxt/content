const { resolve } = require('path')
const contentModule = require('@nuxt/content')

const getLocales = () => [{
  code: 'fr',
  iso: 'fr-FR',
  file: 'fr-FR.js',
  name: 'Français'
}, {
  code: 'en',
  iso: 'en-US',
  file: 'en-US.js',
  name: 'English'
}]

module.exports = {
  rootDir: resolve(__dirname, '../../..'),
  srcDir: __dirname,
  modules: [
    ['nuxt-i18n', {
      locales: getLocales(),
      // The other nuxt-i18n's options are excerpted from @nuxt/theme-docs
      defaultLocale: 'en',
      parsePages: false,
      lazy: true,
      seo: false,
      langDir: 'i18n/'
    }],
    contentModule
  ],
  hooks: {
    'content:file:beforeInsert': (document) => {
      const regexp = new RegExp(`^/(${getLocales().map(locale => locale.code).join('|')})`, 'gi')
      const dir = document.dir.replace(regexp, '')
      const slug = document.slug.replace(/^index/, '')

      document.to = `${dir}/${slug}`
    }
  }
}
