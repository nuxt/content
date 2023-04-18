export default defineNuxtConfig({
  extends: ['../shared'],
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
