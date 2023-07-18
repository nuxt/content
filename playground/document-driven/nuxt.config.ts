export default defineNuxtConfig({
  extends: ['../shared'],
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/ico',
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
