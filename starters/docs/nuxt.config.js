export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
      { hid: 'og:title', name: 'og:title', content: 'Nuxt Content' },
      { hid: 'og:description', name: 'og:description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#48bb78' },
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/i18n',
    '@/plugins/vue-scrollactive',
    '@/plugins/components',
    '@/plugins/menu.client'
  ],
  /*
  ** Give routes to static generation
  */
  generate: {
    async routes () {
      const { $content } = require('@nuxtjs/content')

      const promises = ['en', 'fr'].map(async (locale) => {
        const files = await $content(locale).only(['path']).fetch()

        return files.map(file => file.path.replace(/\/en/, '').replace(/\/index/, '')).filter(path => !!path)
      })

      const [en, fr] = await Promise.all(promises)

      return [...en, ...fr]
    }
  },
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
    // Doc: https://github.com/nuxt-community/color-mode-module
    '@nuxtjs/color-mode'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    'nuxt-i18n',
    '@nuxtjs/pwa',
    '@nuxtjs/content'
  ],
  /*
  ** Modules configuration
  */
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
  purgeCSS: {
    whitelist: ['dark-mode'],
    whitelistPatternsChildren: [/^token/, /^pre/, /^code/, /^nuxt-content/]
  },
  i18n: {
    locales: [{
      code: 'fr',
      iso: 'fr-FR',
      file: 'fr-FR.js',
      name: 'Français'
    }, {
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
}
