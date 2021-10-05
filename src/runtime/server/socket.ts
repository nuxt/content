import { Socket } from 'net'
import { IncomingMessage } from 'http'
import { Nuxt } from '@nuxt/kit'
import WS from 'ws'
import type { DocusOptions } from 'types'

let wss: WS.Server

/**
 * WebSocket server useful for live content reload.
 */
export function useWebSocket(options: DocusOptions, nuxt: Nuxt) {
  if (!wss) wss = new WS.Server({ noServer: true })

  nuxt.hook('listen', server =>
    server.on('upgrade', (req: IncomingMessage, socket: Socket, head: any) => {
      if (req.url === `/${options.apiBase}/ws`) {
        serve(req, socket, head)
      }
    })
  )

  const serve = (req: IncomingMessage, socket = req.socket, head: any = '') =>
    wss.handleUpgrade(req, socket, head, (client: any) => wss.emit('connection', client, req))

  const broadcast = (data: any) => {
    data = JSON.stringify(data)

    for (const client of wss.clients) {
      try {
        client.send(data)
      } catch (err) {
        /* Ignore error (if client not ready to receive event) */
      }
    }
  }

  return {
    serve,
    broadcast
  }
}
