import { joinURL } from 'ufo'
import { useWebSocket } from '#docus/composables/websocket'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin(() => {
  let runtimeConfig = useRuntimeConfig()

  if (process.client) {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const baseUrl = joinURL(runtimeConfig.docus.wsUrl || `${protocol}://${location.hostname}:${location.port}`, runtimeConfig.docus.apiBase)
    useWebSocket(baseUrl)?.connect()
  }
})
