export default defineNuxtConfig({
  ssr: false,

  extends: ['../shared'],

  content: {
    search: {
      mode: 'full-text',
      indexed: true,
      filterQuery: { _draft: false, _partial: true }
    }
  },

  typescript: {
    includeWorkspace: true
  }
})
