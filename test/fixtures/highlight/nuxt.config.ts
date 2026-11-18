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
            dark: 'material-theme-palenight',
            default: 'material-theme-lighter',
          },
        },
      },
    },
  },
})
