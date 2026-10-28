import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    // Registered before `@nuxt/ui` so its `hasNuxtModule('@nuxt/content')` check
    // sees it and registers the `Prose*` and content components.
    MyModule,
    '@nuxt/ui',
  ],
  css: ['~/assets/css/main.css'],
})
