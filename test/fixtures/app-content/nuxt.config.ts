import MyModule from '../../../src/module'

export default defineNuxtConfig({
  // Its own `app/content.ts` is shadowed by the project's.
  extends: ['./base-layer'],
  modules: [
    MyModule,
  ],
  content: {
    compatibilityVersion: 4,
  },
})
