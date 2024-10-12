import { defineNuxtPlugin } from 'nuxt/app'
import { useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(() => {
  const publicConfig = useRuntimeConfig().public

  if (import.meta.client && publicConfig.content.wsUrl) {
    // Connect to websocket
    import('../utils/internal/websocket').then(({ useContentWebSocket }) => useContentWebSocket())
  }
})
