export default defineNuxtConfig({
  ssr: false,

  extends: ['../shared'],

  content: {
    experimental: {
      search: {
        mode: 'full-text',
        indexed: true,
        filterQuery: { _draft: false, _partial: false }
      }
    }
  },

  typescript: {
    includeWorkspace: true
  }
})
