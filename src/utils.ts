import type { IncomingMessage } from 'http'
import { resolve } from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import fsDriver from 'unstorage/drivers/fs'
import { WebSocketServer } from 'ws'
import consola from 'consola'

type MountOptions = {
  driver: 'fs' | 'http' | 'memory' | string
  driverOptions?: Record<string, any>
}

export const logger = consola.withScope('content')

export const MOUNT_PREFIX = 'content:source:'

export const PROSE_TAGS = [
  'p',
  'a',
  'blockquote',
  'code-inline',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'ul',
  'ol',
  'li',
  'strong',
  'table',
  'thead',
  'tbody',
  'td',
  'th',
  'tr'
]

/**
 * Resolve driver of a mount.
 */
export function getMountDriver (mount: MountOptions) {
  if (mount.driver === 'fs') {
    return fsDriver(mount.driverOptions || {})
  }

  try {
    return require(mount.driver).default(mount.driverOptions || {})
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Couldn't load driver", mount.driver)
  }
}

/**
 * Generate mounts for content storages
 */
export function useContentMounts (nuxt: Nuxt, storages: Array<string | (MountOptions & { base: string })>) {
  const key = (path: string) => `${MOUNT_PREFIX}${path.replace(/[/:]/g, '_')}`

  return storages.reduce((mounts, storage) => {
    if (typeof storage === 'string') {
      mounts[key(storage)] = {
        driver: 'fs',
        driverOptions: {
          base: resolve(nuxt.options.srcDir, storage)
        }
      }
    }

    if (typeof storage === 'object') {
      mounts[key(storage.base)] = {
        driver: storage.driver,
        driverOptions: storage.driverOptions
      }
    }

    return mounts
  }, {} as Record<string, MountOptions>)
}
/**
 * WebSocket server useful for live content reload.
 */
export function createWebSocket () {
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
