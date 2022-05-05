import { createApp } from 'vue'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { ContentPreviewMode } from '#components'

export default defineNuxtPlugin(async (nuxtApp) => {
  const publicConfig = useRuntimeConfig().public

  if (process.client && publicConfig.content.wsUrl) {
    // Connect to websocket
    import('./composables/web-socket').then(({ useContentWebSocket }) => useContentWebSocket())
  }
  const { query } = useRoute()
  const previewToken = useCookie('previewToken')

  // If opening a preview link
  if (query._preview) {
    // Set the preview cookie
    previewToken.value = String(query._preview)
  }

  if (process.client && previewToken.value) {
    console.info('👀 Preview mode activated:', previewToken.value)

    const io = await import('socket.io-client')
    const socket = io.connect(`http://localhost:1337/preview:${previewToken.value}`, {
      transports: ['websocket', 'polling']
    })

    socket.on('draft:update', () => {
      refreshNuxtData()
    })

    nuxtApp.hooks.hookOnce('app:mounted', () => {
      const wrapper = document.createElement('div')
      wrapper.id = 'content-preview-wrapper'
      document.body.appendChild(wrapper)
      createApp(ContentPreviewMode, { previewToken }).mount(wrapper)
    })
  }
})
