export default defineNuxtConfig({
  ssr: false,

  extends: ['../shared'],

  content: {
    experimental: {
      search: {
        indexed: true,
        filterQuery: { _draft: false, _partial: false }
      }
    }
  },

  typescript: {
    includeWorkspace: true
  }
})
