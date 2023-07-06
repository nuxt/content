export default defineNuxtConfig({
  extends: ['../shared'],

  content: {
    search: {
      mode: 'full-text',
      noExtractionFromTags: ['style', 'code']
    }
  },

  typescript: {
    includeWorkspace: true
  }
})
