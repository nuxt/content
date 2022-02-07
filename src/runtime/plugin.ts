import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  if (process.client && config.content.wsUrl) {
    // Connect to websocket
    import('./composables/web-socket').then(({ useWebSocket }) => useWebSocket())
  }
})
