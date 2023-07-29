export default defineNuxtConfig({
  extends: ['../shared'],

  content: {
    contentHead: false
  },

  typescript: {
    includeWorkspace: true
  }
})
