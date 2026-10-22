import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            dark: 'github-dark',
            default: 'github-light',
          },
        },
      },
    },
  },
})
