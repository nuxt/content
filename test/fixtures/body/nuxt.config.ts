import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  content: {
    build: {
      markdown: {
        toc: { depth: 3 },
      },
    },
  },
})
