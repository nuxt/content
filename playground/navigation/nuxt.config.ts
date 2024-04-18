import contentModule from '../../src/module'

export default defineNuxtConfig({
  modules: [
    // @ts-expect-error
    contentModule
  ],
  content: {
    documentDriven: true
  }
})
