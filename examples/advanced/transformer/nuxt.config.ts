import MyModule from './my-module/my-module'

export default defineNuxtConfig({
  modules: [
    // @ts-expect-error
    MyModule,
    '@nuxt/content'
  ]
})
