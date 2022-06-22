import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(() => {
  const publicConfig = useRuntimeConfig().public

  if (process.client && publicConfig.content.wsUrl) {
    // Connect to websocket
    import('../composables/web-socket').then(({ useContentWebSocket }) => useContentWebSocket())
  }
})
