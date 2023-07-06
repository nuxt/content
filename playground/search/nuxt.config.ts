export default defineNuxtConfig({
  extends: ['../shared'],

  content: {
    search: {
      mode: 'full-text'
    }
  },

  typescript: {
    includeWorkspace: true
  }
})
