import theme from '@nuxt/content-theme-docs'

const script = []
if (process.env.NODE_ENV === 'production') {
  script.push({
    hid: 'umami',
    src: 'https://analytics.nuxtjs.app/umami.js',
    'data-website-id': '97145a8a-228c-4f7b-86bc-a6af7bd9a7c0',
    defer: true,
    async: true
  })
}

export default theme({
  head: {
    script
  },
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN
  },
  loading: { color: '#00CD81' },
  i18n: {
    locales: () => [{
      code: 'ru',
      iso: 'ru-RU',
      file: 'ru-RU.js',
      name: 'Русский'
    }, {
      code: 'fr',
      iso: 'fr-FR',
      file: 'fr-FR.js',
      name: 'Français'
    }, {
      code: 'ja',
      iso: 'ja_JP',
      file: 'ja_JP.js',
      name: '日本語'
    }, {
      code: 'en',
      iso: 'en-US',
      file: 'en-US.js',
      name: 'English'
    }],
    defaultLocale: 'en'
  },
  buildModules: [
    'nuxt-ackee'
  ],
  ackee: {
    server: 'https://ackee.nuxtjs.com',
    domainId: '7b3c9779-442c-40c6-9931-ea71977c52a8',
    detailed: true
  },
  pwa: {
    manifest: {
      name: 'Nuxt Content'
    }
  }
})
