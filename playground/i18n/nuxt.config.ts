import contentModule from '../../src/module'

export default defineNuxtConfig({
  modules: [
    // @ts-ignore
    contentModule
  ],
  content: {
    documentDriven: true,
    locales: ['en', 'zh'],
    defaultLocale: 'zh'
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh'
      }
    }
  },
  devtools: true
})
