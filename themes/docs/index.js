import path from 'path'
import defu from 'defu'

import install from './dependencies'

export default userConfig => defu(userConfig, {
  target: 'static',
  ssr: true,
  srcDir: __dirname,
  modulesDir: [
    path.join(__dirname, 'mode_modules')
  ],
  buildDir: path.join(__dirname, '.nuxt'),
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  css: [
    '~/assets/css/content.css'
  ],
  plugins: [
    '@/plugins/markdown',
    '@/plugins/init',
    '@/plugins/i18n.client',
    '@/plugins/vue-scrollactive',
    '@/plugins/menu.client'
  ],
  buildModules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    'nuxt-ackee'
  ],
  modules: [
    'nuxt-i18n',
    '@nuxtjs/pwa',
    '@nuxt/content'
  ],
  components: true,
  hooks: {
    'modules:before': async ({ nuxt }) => {
      await install(nuxt.options)
      // Configure @nuxt/content dir
      nuxt.options.content.dir = path.resolve(nuxt.options.rootDir, nuxt.options.content.dir || 'content')
      // Configure static dir
      nuxt.options.dir.static = `${nuxt.options.rootDir}/static`
      // Configure
      nuxt.options.modulesDir.push(path.join(nuxt.options.rootDir, 'node_modules'))
    }
  },
  colorMode: {
    preference: 'light'
  },
  content: {
    markdown: {
      prism: {
        theme: 'prism-themes/themes/prism-material-oceanic.css'
      }
    }
  },
  i18n: {
    locales: [{
      code: 'en',
      iso: 'en-US',
      file: 'en-US.js',
      name: 'English'
    }],
    defaultLocale: 'en',
    parsePages: false,
    lazy: true,
    seo: false,
    langDir: 'i18n/'
  }
})
