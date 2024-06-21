export default defineNuxtConfig({
  extends: ['../shared'],
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          href: '/favicon.ico'
        }
      ]
    }
  },
  content: {
    documentDriven: {
      globals: {
        theme: {
          where: [{
            _id: 'content:_theme.yml'
          }],
          without: ['_']
        }
      },
      layoutFallbacks: ['theme']
    }
  }
})
