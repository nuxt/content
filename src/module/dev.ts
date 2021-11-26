import type { IncomingMessage } from 'http'
import type { Socket } from 'net'
import type { WatchEvent } from 'unstorage'
import { addPlugin, resolveModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { resolve } from 'pathe'
import * as Debounce from 'debounce'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { useWebSocket } from '../runtime/server/socket'
import { logger } from '../runtime/utils'
import { templateDir } from '../dirs'
import { loadNuxtIgnoreList } from './utils'
import { DocusOptions } from 'types'

export function setupDevTarget(options: DocusOptions, nuxt: Nuxt) {
  const ws = useWebSocket()

  if (options.watch) {
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
      storage.mount(
        'assets:docus:build',
        fsDriver({
          base: resolve(nuxt.options.buildDir, 'docus/build')
        })
      )
    })

    // Create socket server
    nuxt.server.listen(0).then(({ url, server }: { url: string; server: any }) => {
      nuxt.options.publicRuntimeConfig.docus.wsUrl = url.replace('http', 'ws')

      server.on('upgrade', (req: IncomingMessage, socket: Socket, head: any) => ws.serve(req, socket, head))

      /**
       * Broadcast a message to the server to refresh the page
       **/
      const broadcast = Debounce.debounce((event: WatchEvent, key: string) => ws.broadcast({ event, key }), 200)

      // Watch contents
      storage.watch(async (event: WatchEvent, key: string) => {
        if (key.startsWith('assets')) return
        if (key.endsWith('.md')) {
          switch (event) {
            case 'remove':
              await storage.removeItem(`assets:docus:build:${key}`)
              logger.info(`You removed ${key}`)
              return
            case 'update':
            default:
              /**
               * This is required to create cache entry for new files
               * Whithout this the file will not be served
               */
              await storage.setItem(`assets:docus:build:${key}`, false)
              logger.info(`You updated ${key}`)
          }
          broadcast(event, key)
        }
      })
    })
  }
}
