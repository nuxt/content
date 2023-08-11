import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(async () => {
  const publicConfig = useRuntimeConfig().public

  if (process.client && publicConfig.content.wsUrl) {
    // Connect to websocket
    // import('../composables/web-socket').then(({ useContentWebSocket }) => useContentWebSocket())
    if (import.meta.hot) {
      import.meta.hot.on('content:updated', () => {
        console.log('content updated !')
        refreshNuxtData()
      })
    }
  }
})
