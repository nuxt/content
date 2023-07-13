export default defineNuxtConfig({
  extends: ['../shared'],

  content: {
    search: {
      mode: 'full-text',
      indexedSearch: false
    }
  },

  typescript: {
    includeWorkspace: true
  }
})
