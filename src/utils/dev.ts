import crypto from 'node:crypto'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import type { IncomingMessage } from 'node:http'
import Database from 'better-sqlite3'
import type { Nuxt } from '@nuxt/schema'
import { addVitePlugin, isIgnored, updateTemplates, useLogger } from '@nuxt/kit'
import type { ConsolaInstance } from 'consola'
import chokidar from 'chokidar'
import micromatch from 'micromatch'
import { resolve } from 'pathe'
import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import { listen, type Listener } from 'listhen'
import type { ResolvedCollection } from '../types/collection'
import type { ModuleOptions } from '../types'
import { generateCollectionInsert, parseSourceBase } from './collection'
import { parseContent } from './content'

export const logger: ConsolaInstance = useLogger('@nuxt/content')

export async function watchContents(nuxt: Nuxt, collections: ResolvedCollection[], options: ModuleOptions, manifest: { dump: string[] }) {
  const db = localDatabase(options._localDatabase!.filename)

  const localCollections = collections.filter(c => c.source && !c.source.repository)

  const watcher = chokidar.watch('.', {
    ignoreInitial: true,
    cwd: join(nuxt.options.rootDir, 'content'),
  })

  watcher.on('add', onChange)
  watcher.on('change', onChange)
  watcher.on('unlink', onRemove)

  let websocket: ReturnType<typeof createWebSocket>
  let listener: Listener
  const websocketOptions = options.watch || {}
  if (websocketOptions.enabled) {
    nuxt.hook('nitro:init', async (nitro) => {
      websocket = createWebSocket()

      // Listen dev server
      listener = await listen(() => 'Nuxt Content', websocketOptions)

      // Register ws url
      nitro.options.runtimeConfig.public.content.wsUrl = listener.url.replace('http', 'ws')

      listener.server.on('upgrade', websocket.serve)
    })
  }

  async function onChange(path: string) {
    const collection = localCollections.find(({ source }) => micromatch.isMatch(path, source!.path, { ignore: source!.ignore || [], dot: true }))
    if (collection) {
      logger.info(`File changed. collection: ${collection.name}, path: ${path}`)

      const { fixed } = parseSourceBase(collection.source!)
      const keyInCollection = join(collection.name, collection.source?.prefix || '', path.replace(fixed, ''))

      const content = await readFile(join(nuxt.options.rootDir, 'content', path), 'utf8')
      const checksum = getContentChecksum(content)
      const localCache = db.fetchDevelopmentCacheForKey(keyInCollection)

      if (localCache && localCache.checksum === checksum) {
        db.exec(generateCollectionInsert(collection, JSON.parse(localCache.parsedContent)))
        return
      }

      const parsedContent = await parseContent(keyInCollection, content, collection, options.build)

      const insertQuery = generateCollectionInsert(collection, parsedContent)
      await db.exec(insertQuery)
      db.insertDevelopmentCache(keyInCollection, checksum, JSON.stringify(parsedContent))

      const queryPrefix = insertQuery.split('(')[0]
      const index = manifest.dump.findIndex(item => item.startsWith(queryPrefix) && item.includes(`'${keyInCollection}'`))
      if (index !== -1) {
        manifest.dump.splice(index, 1, insertQuery)
        await updateTemplates({
          filter: template => template.filename === 'content/dump.mjs',
        })
      }

      websocket?.broadcast({
        path,
        collection: collection.name,
        query: insertQuery,
      })
    }
  }

  async function onRemove(path: string) {
    const collection = localCollections.find(({ source }) => micromatch.isMatch(path, source!.path, { ignore: source!.ignore || [], dot: true }))
    if (collection) {
      logger.info(`File removed. collection: ${collection.name}, path: ${path}`)

      const { fixed } = parseSourceBase(collection.source!)
      const keyInCollection = join(collection.name, collection.source?.prefix || '', path.replace(fixed, ''))

      const updateQuery = `DELETE FROM ${collection.tableName} WHERE contentId = '${keyInCollection}'`
      await db.exec(updateQuery)
      await db.deleteDevelopmentCache(keyInCollection)

      websocket?.broadcast({
        path,
        collection: collection.name,
        query: updateQuery,
      })
    }
  }

  nuxt.hook('close', async () => {
    watcher.close()
    db.close()
    // Close WebSocket server
    await websocket.close()
    await listener.server.close()
  })
}

export function watchComponents(nuxt: Nuxt) {
  const componentsTemplatePath = join(nuxt.options.buildDir, 'content/components.ts')
  nuxt.options.vite.server ||= {}
  nuxt.options.vite.server.watch ||= {}
  nuxt.options.vite.server.watch.ignored = (file) => {
    return file !== componentsTemplatePath && isIgnored(file)
  }

  let componentDirs: string[] = []
  nuxt.hook('components:dirs', (allDirs) => {
    componentDirs = allDirs.map(dir => typeof dir === 'string' ? dir : dir.path).filter(Boolean)
  })

  nuxt.hook('builder:watch', async (event, relativePath) => {
    if (!['add', 'unlink'].includes(event)) {
      return
    }
    const path = resolve(nuxt.options.srcDir, relativePath)
    if (componentDirs.some(dir => path.startsWith(dir + '/'))) {
      await updateTemplates({
        filter: template => ['content/components.ts'].includes(template.filename),
      })
    }
  })
  // Reload page when content/components.ts is changed
  addVitePlugin({
    name: 'reload',
    configureServer(server) {
      server.watcher.on('change', (file) => {
        if (file === componentsTemplatePath) {
          server.ws.send({
            type: 'full-reload',
          })
        }
      })
    },
  })
}

export function watchConfig(nuxt: Nuxt) {
  nuxt.hook('nitro:init', async (nitro) => {
    nitro.storage.watch(async (_event, key) => {
      if ('root:content.config.ts' === key) {
        logger.info(`${key.split(':').pop()} Updated. Restarting Nuxt...`)

        nuxt.hooks.callHook('restart', { hard: true })
      }
    })
  })
}

/**
 * WebSocket server useful for live content reload.
 */
export function createWebSocket() {
  const wss = new WebSocketServer({ noServer: true })

  const serve = (req: IncomingMessage, socket = req.socket, head: Buffer) =>
    wss.handleUpgrade(req, socket, head, (client: WebSocket) => {
      wss.emit('connection', client, req)
    })

  const broadcast = (data: unknown) => {
    const message = JSON.stringify(data)

    for (const client of wss.clients) {
      try {
        client.send(message)
      }
      catch (err) {
        /* Ignore error (if client not ready to receive event) */
        console.log(err)
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
    },
  }
}

export function getContentChecksum(content: string) {
  return crypto
    .createHash('md5')
    .update(content, 'utf8')
    .digest('hex')
}

let _localDatabase: Database.Database | undefined
export function localDatabase(databaseLocation: string) {
  if (!_localDatabase) {
    _localDatabase = Database(databaseLocation)
    _localDatabase!.exec('CREATE TABLE IF NOT EXISTS _development_cache (id TEXT PRIMARY KEY, checksum TEXT, parsedContent TEXT)')
  }

  return {
    fetchDevelopmentCache() {
      return _localDatabase!.prepare<unknown[], { id: string, checksum: string, parsedContent: string }>('SELECT * FROM _development_cache')
        .all()
        .reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {} as Record<string, { checksum: string, parsedContent: string }>)
    },
    fetchDevelopmentCacheForKey(key: string) {
      return _localDatabase!.prepare<unknown[], { id: string, checksum: string, parsedContent: string }>('SELECT * FROM _development_cache WHERE id = ?')
        .get(key)
    },
    insertDevelopmentCache(id: string, checksum: string, parsedContent: string) {
      _localDatabase!.exec(`INSERT OR REPLACE INTO _development_cache (id, checksum, parsedContent) VALUES ('${id}', '${checksum}', '${parsedContent.replace(/'/g, '\'\'')}')`)
    },
    deleteDevelopmentCache(id: string) {
      _localDatabase!.exec(`DELETE FROM _development_cache WHERE id = '${id}'`)
    },
    exec: (sql: string) => {
      _localDatabase!.exec(sql)
    },
    close: () => {
      _localDatabase!.close()
      _localDatabase = undefined
    },
  }
}

export function* chunks<T>(arr: T[], size: number): Generator<T[], void, unknown> {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size)
  }
}
