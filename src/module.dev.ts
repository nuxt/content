import { Socket } from 'net'
import { IncomingMessage } from 'http'
// @ts-ignore
import { resolve } from 'pathe'
import fetch from 'node-fetch'
import { joinURL } from 'ufo'
import { Nuxt } from '@nuxt/kit'
import { debounce } from 'debounce'
import { WatchEvent, createStorage, WatchCallback } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { useWebSocket } from './runtime/server/socket'
import { logger } from './runtime/utils'
import { useNuxtIgnoreList } from './utils'

export default function setupDevTarget(options: any, nuxt: Nuxt) {
  const ws = useWebSocket(options, nuxt)

  if (options.watch) {
    const storage = createStorage()
    useNuxtIgnoreList(nuxt).then(ignoreList => {
      storage.mount(
        'content',
        fsDriver({
          base: resolve(nuxt.options.srcDir, 'content'),
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
          await fetch(joinURL(url, 'api', options.apiBase, 'reload', key))

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
      logger.info(`${key} ${event}`)
    }
  }
}
