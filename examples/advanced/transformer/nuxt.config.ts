import MyModule from './my-module/my-module'

export default defineNuxtConfig({
  modules: [
    // @ts-ignore
    MyModule,
    '@nuxt/content'
  ]
})
