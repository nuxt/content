import type { IncomingMessage } from 'http'
import { resolve } from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import fsDriver from 'unstorage/drivers/fs'
import httpDriver from 'unstorage/drivers/http'
import { WebSocketServer } from 'ws'
import consola from 'consola'
import { resolveModule } from '@nuxt/kit'
import type { ModuleOptions, MountOptions } from './module'

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

  if (mount.driver === 'http') {
    return httpDriver(mount.driverOptions || {})
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
export function useContentMounts (nuxt: Nuxt, storages: Array<string | MountOptions>) {
  const key = (path: string, prefix: string = '') => `${MOUNT_PREFIX}${path.replace(/[/:]/g, '_')}${prefix.replace(/\//g, ':')}`

  return storages.reduce((mounts, storage) => {
    if (typeof storage === 'string') {
      mounts[key(storage)] = {
        name: storage,
        driver: 'fs',
        prefix: '',
        driverOptions: {
          base: resolve(nuxt.options.srcDir, storage)
        }
      }
    }

    if (typeof storage === 'object') {
      mounts[key(storage.name, storage.prefix)] = {
        name: storage.name,
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
    close: () => new Promise(resolve => wss.close(resolve))
  }
}

export function processMarkdownOptions (nuxt: Nuxt, options: ModuleOptions['markdown']) {
  options.rehypePlugins = (options.rehypePlugins || []).map(resolveMarkdownPlugin).filter(Boolean)
  options.remarkPlugins = (options.remarkPlugins || []).map(resolveMarkdownPlugin).filter(Boolean)

  return options

  function resolveMarkdownPlugin (plugin: string | [string, any]): [string, any] {
    if (typeof plugin === 'string') { plugin = [plugin, {}] }

    if (!Array.isArray(plugin)) {
      logger.warn('Plugin silently ignored:', (plugin as any).name || plugin)
      return
    }

    return [resolveModule(plugin[0], { paths: nuxt.options.srcDir }), plugin[1]]
  }
}
