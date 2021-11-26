import { joinURL } from 'ufo'
import { useWebSocket } from '#docus/composables/websocket'

export default async function (ctx: any) {
  let runtimeConfig = ctx.$config ? ctx.$config : ctx.nuxtState

  if (process.client) {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const baseUrl = joinURL(runtimeConfig.docus.wsUrl || `${protocol}://${location.hostname}:${location.port}`, runtimeConfig.docus.apiBase)
    useWebSocket(baseUrl)?.connect()
  }
}
