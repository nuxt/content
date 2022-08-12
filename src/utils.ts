import type { IncomingMessage } from 'http'
import { resolve } from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import fsDriver from 'unstorage/drivers/fs'
import httpDriver from 'unstorage/drivers/http'
import githubDriver from 'unstorage/drivers/github'
import { WebSocketServer } from 'ws'
import { useLogger } from '@nuxt/kit'
import type { ModuleOptions, MountOptions } from './module'
import type { MarkdownPlugin } from './runtime/types'

export const logger = useLogger('@nuxt/content')

/**
 * Internal version that represents cache format.
 * This is used to invalidate cache when the format changes.
 */
export const CACHE_VERSION = 2

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

const unstorageDrivers = {
  fs: fsDriver,
  http: httpDriver,
  github: githubDriver
}
/**
 * Resolve driver of a mount.
 */
export function getMountDriver (mount: MountOptions) {
  if (unstorageDrivers[mount.driver]) {
    return unstorageDrivers[mount.driver](mount as any)
  }

  try {
    return require(mount.driver).default(mount as any)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Couldn't load driver", mount.driver)
  }
}

/**
 * Generate mounts for content storages
 */
export function useContentMounts (nuxt: Nuxt, storages: Array<string | MountOptions> | Record<string, MountOptions>) {
  const key = (path: string, prefix: string = '') => `${MOUNT_PREFIX}${path.replace(/[/:]/g, '_')}${prefix.replace(/\//g, ':')}`

  if (Array.isArray(storages)) {
    logger.warn('Using array syntax to define sources is deprecated. Consider using object syntax.')
    storages = storages.reduce((mounts, storage) => {
      if (typeof storage === 'string') {
        mounts[key(storage)] = {
          name: storage,
          driver: 'fs',
          prefix: '',
          base: resolve(nuxt.options.srcDir, storage)
        }
      }

      if (typeof storage === 'object') {
        mounts[key(storage.name, storage.prefix)] = storage
      }

      return mounts
    }, {} as Record<string, MountOptions>)
  } else {
    storages = Object.entries(storages).reduce((mounts, [name, storage]) => {
      mounts[key(storage.name || name, storage.prefix)] = storage
      return mounts
    }, {})
  }

  const defaultStorage = key('content')
  if (!storages[defaultStorage]) {
    storages[defaultStorage] = {
      name: defaultStorage,
      driver: 'fs',
      base: resolve(nuxt.options.srcDir, 'content')
    }
  }

  return storages
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
    close: () => {
      // disconnect all clients
      wss.clients.forEach(client => client.close())
      // close the server
      return new Promise(resolve => wss.close(resolve))
    }
  }
}

export function processMarkdownOptions (options: ModuleOptions['markdown']) {
  return {
    ...options,
    remarkPlugins: resolveMarkdownPlugins(options.remarkPlugins),
    rehypePlugins: resolveMarkdownPlugins(options.rehypePlugins)
  }
}

function resolveMarkdownPlugins (plugins): Record<string, false | MarkdownPlugin> {
  if (Array.isArray(plugins)) {
    return Object.values(plugins).reduce((plugins, plugin) => {
      const [name, pluginOptions] = Array.isArray(plugin) ? plugin : [plugin, {}]
      plugins[name] = pluginOptions
      return plugins
    }, {})
  }
  return plugins || {}
}
