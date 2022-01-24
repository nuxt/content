import type { IncomingMessage } from 'http'
import type { Nuxt } from '@nuxt/schema'
import { createStorage } from 'unstorage'
import type { WatchEvent } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import Debounce from 'debounce'
import { WebSocketServer } from 'ws'
import { MountOptions, useContentMounts } from './content'
import { logger } from './utils'

/**
 * WebSocket server useful for live content reload.
 */
function createWebSocket() {
  const wss = new WebSocketServer({ noServer: true })

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
    broadcast,
    close: () => wss.close()
  }
}

/**
 * Resolve driver of a mount.
 */
function getMountDriver(mount: MountOptions) {
  if (mount.driver === 'fs') {
    return fsDriver(mount.driverOptions || {})
  }

  try {
    return require(mount.driver).default(mount.driverOptions || {})
  } catch (e) {
    console.error("Couldn't load driver", mount.driver)
  }
}

export function setupContentDevModule(options: any, nuxt: Nuxt) {
  // Create storage instance
  const storage = createStorage()
  const mounts = useContentMounts(nuxt, options.content.sources)
  for (const mount in mounts) storage.mount(mount, getMountDriver(mounts[mount]))

  const ws = createWebSocket()

  // Create socket server
  nuxt.server.listen(0).then(({ url, server }: { url: string; server: any }) => {
    // Inject socket server address into runtime config
    nuxt.options.publicRuntimeConfig.docus.wsUrl = url.replace('http', 'ws')

    server.on('upgrade', ws.serve)

    // Broadcast a message to the server to refresh the page
    const broadcast = Debounce.debounce(ws.broadcast, 200)

    // Watch contents
    storage.watch((event: WatchEvent, key: string) => {
      key = key.substring('docus:source:'.length)
      logger.info(`${key} ${event}d`)
      broadcast({ event, key })
    })
  })

  // Dispose storage on nuxt close
  nuxt.hook('close', () => {
    storage.dispose()
    ws.close()
  })
}
