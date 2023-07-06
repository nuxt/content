export default defineNuxtConfig({
  extends: ['../shared'],

  content: {
    search: {
      mode: 'full-text',
      indexedSearch: true
    }
  },

  typescript: {
    includeWorkspace: true
  }
})
