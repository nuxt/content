const URL = 'https://content.nuxtjs.org'

export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: (chunk) => {
      if (chunk) {
        return `${chunk} - Nuxt Content`
      }

      return 'Nuxt Content'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // Open Graph
      { hid: 'og:site_name', property: 'og:site_name', content: 'Nuxt Content' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:url', property: 'og:url', content: URL },
      { hid: 'og:image', property: 'og:image', content: `${URL}/card.png` },
      // Twitter Card
      { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      { hid: 'twitter:site', name: 'twitter:site', content: '@nuxt_js' },
      { hid: 'twitter:title', name: 'twitter:title', content: 'Nuxt Content' },
      { hid: 'twitter:image', name: 'twitter:image', content: `${URL}/card.png` },
      { hid: 'twitter:image:alt', name: 'twitter:image:alt', content: 'The NuxtJS Framework' }
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' }
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
    '@/plugins/i18n.client',
    '@/plugins/vue-scrollactive',
    '@/plugins/components',
    '@/plugins/menu.client'
  ],
  /*
  ** Give routes to static generation
  */
  generate: {
    async routes () {
      const { $content } = require('@nuxt/content')

      const promises = ['en'].map(async (locale) => {
        const files = await $content(locale).only(['path']).fetch()

        return files.map(file => file.path.replace(/\/en/, '').replace(/\/index/, '/')).filter(path => !!path)
      })

      const [en] = await Promise.all(promises)

      return [...en]
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
    '@nuxtjs/color-mode',
    // https://github.com/bdrtsky/nuxt-ackee
    'nuxt-ackee'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    'nuxt-i18n',
    '@nuxtjs/pwa',
    '@nuxt/content'
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
  i18n: {
    // locales: [{
    //   code: 'fr',
    //   iso: 'fr-FR',
    //   file: 'fr-FR.js',
    //   name: 'Français'
    // }, {
    //   code: 'en',
    //   iso: 'en-US',
    //   file: 'en-US.js',
    //   name: 'English'
    // }],
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
  },
  ackee: {
    server: 'https://ackee.nuxtjs.com',
    domainId: '7b3c9779-442c-40c6-9931-ea71977c52a8',
    detailed: true
  }
}
