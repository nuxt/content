import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export * from './composables'

export default defineNuxtPlugin((/* { vueApp, ssrContext, hook, hooks, provide } */) => {
  const config = useRuntimeConfig()

  if (process.client && config.docus.wsUrl) {
    // Connect to websocket
    import('./composables/web-socket').then(({ useWebSocket }) => useWebSocket())
  }
})
