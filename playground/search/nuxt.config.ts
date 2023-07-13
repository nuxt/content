export default defineNuxtConfig({
  ssr: false,

  extends: ['../shared'],

  content: {
    search: {
      mode: 'full-text',
      ignorePartials: true,
      ignoreEmpty: true
    }
  },

  typescript: {
    includeWorkspace: true
  }
})
