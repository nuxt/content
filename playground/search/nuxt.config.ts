export default defineNuxtConfig({
  ssr: false,

  extends: ['../shared'],

  content: {
    search: {
      mode: 'full-text',
      indexedSearch: true,
      ignoreQuery: { _draft: false, _partial: true }
    }
  },

  typescript: {
    includeWorkspace: true
  }
})
