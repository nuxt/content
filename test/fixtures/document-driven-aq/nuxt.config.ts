import contentModule from '../../..'

export default defineNuxtConfig({
  modules: [contentModule],
  content: {
    experimental: {
      advanceQuery: true
    },
    documentDriven: {
      globals: {
        theme: {
          where: {
            _id: 'content:_theme.yml'
          },
          without: ['_']
        }
      }
    }
  }
})
