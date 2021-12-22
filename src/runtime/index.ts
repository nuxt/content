import { defineNuxtPlugin } from 'nuxt3'

export default defineNuxtPlugin(({ vueApp, ssrContext, hook, hooks, provide }) => {
  console.log({ vueApp, ssrContext, hook, hooks, provide })

  console.log('Hello World!')
})
