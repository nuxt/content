export default defineNuxtConfig({
  extends: ['../shared'],

  content: {
    search: {
      mode: 'full-text',
      ignorePartials: true,
      ignoreEmpty: true,
    }
  },

  typescript: {
    includeWorkspace: true
  }
})
