import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(() => {
  const publicConfig = useRuntimeConfig().public

  if (import.meta.client && publicConfig.content.wsUrl) {
    // Connect to websocket
    import('../composables/web-socket').then(({ useContentWebSocket }) => useContentWebSocket())
  }
})
