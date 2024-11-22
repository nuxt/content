import { defineNuxtPlugin } from 'nuxt/app'
import { useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(() => {
  const publicConfig = useRuntimeConfig().public as { content: { wsUrl: string } }

  if (import.meta.client && publicConfig.content.wsUrl) {
    // Connect to websocket
    import('../internal/websocket').then(({ useContentWebSocket }) => useContentWebSocket())
  }
})
