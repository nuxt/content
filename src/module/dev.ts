import type { IncomingMessage } from 'http'
import type { Socket } from 'net'
import type { WatchEvent, WatchCallback } from 'unstorage'
import { addPlugin, addServerMiddleware, resolveModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { resolve } from 'pathe'
// @ts-ignore
import fetch from 'node-fetch'
import { joinURL } from 'ufo'
import { debounce } from 'debounce'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { useWebSocket } from '../runtime/server/socket'
import { logger } from '../runtime/utils'
import { runtimeDir, templateDir } from '../dirs'
import { resolveApiRoute, loadNuxtIgnoreList } from './utils'
import { DocusOptions } from 'types'

export function setupDevTarget(options: DocusOptions, nuxt: Nuxt) {
  const ws = useWebSocket()

  if (options.watch) {
    // Add reload API
    addServerMiddleware({
      route: resolveApiRoute('reload'),
      handle: resolveModule('./server/api/reload', { paths: runtimeDir }).replace(/\.js$/, '.mjs')
    })

    // Add Hot plugin
    addPlugin(resolveModule('./hot', { paths: templateDir }))

    const storage = createStorage()
    loadNuxtIgnoreList(nuxt).then(ignoreList => {
      options.dirs.forEach(dir => {
        const [path, key] = Array.isArray(dir) ? dir : [dir, dir]
        storage.mount(
          key,
          fsDriver({
            base: resolve(nuxt.options.rootDir, path),
            ignore: ignoreList
          })
        )
      })
    })

    // Create socket server
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
    if (key.endsWith('.md')) {
      handleEvent(event, key)
      switch (event) {
        case 'remove':
          logger.info(`You removed ${key}`)
          return
        case 'update':
          logger.info(`You updated ${key}`)
          return
        default:
          logger.info(`You updated ${key}`)
      }
    }
  }
}
