import { defineNuxtConfig } from 'nuxt/config'
import MyModule from './my-module/my-module'

export default defineNuxtConfig({
  modules: [
    MyModule,
    '@nuxt/content'
  ]
})
