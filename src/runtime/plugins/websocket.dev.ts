import { defineNuxtPlugin } from 'nuxt/app'
import { useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(() => {
  const publicConfig = useRuntimeConfig().public.content as { wsUrl: string }

  if (import.meta.client && publicConfig.wsUrl) {
    // Connect to websocket
    import('../internal/websocket').then(({ useContentWebSocket }) => useContentWebSocket())
  }
})
