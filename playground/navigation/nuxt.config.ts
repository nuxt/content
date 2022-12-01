import contentModule from '../../src/module'

export default defineNuxtConfig({
  modules: [contentModule],
  content: {
    documentDriven: true
  }
})
