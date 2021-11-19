import { joinURL } from 'ufo'
import { useWebSocket } from '#docus/composables/websocket'

export default async function (ctx: any) {
  let { $docus } = ctx.$config ? ctx.$config : ctx.nuxtState

  // TODO: replace with public runtime config
  if (!$docus) {
    $docus = {
      apiBase: '_docus',
      wsUrl: 'ws://localhost:4000'
    }
  }

  if (process.client) {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const baseUrl = joinURL($docus.wsUrl || `${protocol}://${location.hostname}:${location.port}`, $docus.apiBase)
    useWebSocket(baseUrl)?.connect()
  }
}
