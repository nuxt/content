export default defineNuxtConfig({
  extends: ['../shared'],

  content: {
    enableContentHead: false
  },

  typescript: {
    includeWorkspace: true
  }
})
