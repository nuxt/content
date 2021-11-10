import type { IncomingMessage } from 'http'
import type { Socket } from 'net'
import type { WatchEvent, WatchCallback } from 'unstorage'
import type { Nuxt } from '@nuxt/kit'
import { resolve } from 'pathe'
// @ts-ignore
import fetch from 'node-fetch'
import { joinURL } from 'ufo'
import { debounce } from 'debounce'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { useWebSocket } from './runtime/server/socket'
import { logger } from './runtime/utils'
import { useNuxtIgnoreList } from './utils'

export default function setupDevTarget(options: any, nuxt: Nuxt) {
  const ws = useWebSocket()

  if (options.watch) {
    const storage = createStorage()
    useNuxtIgnoreList(nuxt).then(ignoreList => {
      storage.mount(
        'content',
        fsDriver({
          base: resolve(nuxt.options.rootDir, 'content'),
          ignore: ignoreList
        })
      )
    })

    // create socket server
    nuxt.server.listen(0).then(({ url, server }: { url: string; server: any }) => {
      // @ts-ignore
      nuxt.options.publicRuntimeConfig.$docus.wsUrl = url.replace('http', 'ws')

      server.on('upgrade', (req: IncomingMessage, socket: Socket, head: any) => ws.serve(req, socket, head))

      // Watch contents
      storage.watch(
        createDebounceContentWatcher(async (event: WatchEvent, key: string) => {
          // call reload api: clear database and navigation
          await fetch(joinURL(url, 'api', options.apiBase, 'reload'), {
            method: 'POST',
            body: JSON.stringify({ event, key })
          })

          /**
           * Broadcast a message to the server to refresh the page
           **/
          ws.broadcast({ event, key })
        })
      )
    })
  }
}

/**
 * Create a watcher for the content folder
 **/
function createDebounceContentWatcher(callback: WatchCallback) {
  const handleEvent = debounce(callback, 200)

  return (event: WatchEvent, key: string) => {
    if (key.endsWith('.md') && ['content'].some(mount => key.startsWith(mount))) {
      handleEvent(event, key)
      logger.info(`[DOCUS]: ${key} ${event}`)
    }
  }
}
