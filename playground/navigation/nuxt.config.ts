import contentModule from '../../src/module'

export default defineNuxtConfig({
  modules: [
    // @ts-ignore
    contentModule
  ],
  content: {
    documentDriven: true
  }
})
