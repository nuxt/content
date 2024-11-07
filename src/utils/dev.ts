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
import type { ModuleOptions, ResolvedCollection } from '../types'
import type { Manifest } from '../types/manifest'
import { generateCollectionInsert } from './collection'
import { parseContent } from './content'
import { moduleTemplates } from './templates'

export const logger: ConsolaInstance = useLogger('@nuxt/content')

export async function watchContents(nuxt: Nuxt, options: ModuleOptions, manifest: Manifest) {
  const cwd = join(nuxt.options.rootDir, 'content')
  const db = localDatabase(options._localDatabase!.filename)
  const collections = manifest.collections

  const localCollections = collections.filter(c => c.source && !c.source.repository)

  const watcher = chokidar.watch('.', { ignoreInitial: true, cwd })

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
      ;(nitro.options.runtimeConfig.public.content as Record<string, unknown>).wsUrl = listener.url.replace('http', 'ws')

      listener.server.on('upgrade', websocket.serve)
    })
  }

  async function broadcast(collection: ResolvedCollection, key: string, insertQuery?: string) {
    const removeQuery = `DELETE FROM ${collection.tableName} WHERE _id = '${key}'`
    await db.exec(removeQuery)
    if (insertQuery) {
      await db.exec(insertQuery)
    }

    const index = manifest.dump[collection.name]?.findIndex(item => item.includes(`'${key}'`))
    if (index && index !== -1) {
      // Update templates to have valid dump for client-side navigation
      if (insertQuery) {
        manifest.dump[collection.name]?.splice(index, 1, insertQuery)
      }
      else {
        manifest.dump[collection.name]?.splice(index, 1)
      }

      await updateTemplates({
        filter: template => [
          moduleTemplates.manifest,
          moduleTemplates.fullCompressedDump,
          // moduleTemplates.raw,
        ].includes(template.filename),
      })
    }

    websocket?.broadcast({
      key,
      collection: collection.name,
      queries: insertQuery ? [removeQuery, insertQuery] : [removeQuery],
    })
  }

  async function onChange(path: string) {
    const collection = localCollections.find(({ source }) => micromatch.isMatch(path, source!.include, { ignore: source!.exclude || [], dot: true }))
    if (collection) {
      logger.info(`File \`${path}\` changed on \`${collection.name}\` collection`)

      const filePath = join(cwd, path).replace(collection.source!.cwd, '')
      const keyInCollection = join(collection.name, collection.source?.prefix || '', filePath)

      const content = await readFile(join(nuxt.options.rootDir, 'content', path), 'utf8')
      const checksum = getContentChecksum(content)
      const localCache = db.fetchDevelopmentCacheForKey(keyInCollection)

      if (localCache && localCache.checksum === checksum) {
        db.exec(`DELETE FROM ${collection.tableName} WHERE _id = '${keyInCollection}'`)
        db.exec(generateCollectionInsert(collection, JSON.parse(localCache.parsedContent)))
        return
      }

      const parsedContent = await parseContent(keyInCollection, content, collection, nuxt)

      db.insertDevelopmentCache(keyInCollection, checksum, JSON.stringify(parsedContent))

      const insertQuery = generateCollectionInsert(collection, parsedContent)
      await broadcast(collection, keyInCollection, insertQuery)
    }
  }

  async function onRemove(path: string) {
    const collection = localCollections.find(({ source }) => micromatch.isMatch(path, source!.include, { ignore: source!.exclude || [], dot: true }))
    if (collection) {
      logger.info(`File \`${path}\` removed from \`${collection.name}\` collection`)

      const filePath = join(cwd, path).replace(collection.source!.cwd, '')
      const keyInCollection = join(collection.name, collection.source?.prefix || '', filePath)

      await db.deleteDevelopmentCache(keyInCollection)

      await broadcast(collection, keyInCollection)
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
  const contentDir = join(nuxt.options.rootDir, 'content')
  const componentsTemplatePath = join(nuxt.options.buildDir, 'content/components.ts')
  nuxt.options.vite.server ||= {}
  nuxt.options.vite.server.watch ||= {}
  nuxt.options.vite.server.watch.ignored = (file) => {
    if (file.startsWith(contentDir)) {
      return true
    }
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
        filter: template => [moduleTemplates.components].includes(template.filename),
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
        logger.info(`\`${key.split(':').pop()}\` updated, restarting the Nuxt server...`)

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

const _localDatabase: Record<string, Database.Database | undefined> = {}
export function localDatabase(databaseLocation: string) {
  if (!_localDatabase[databaseLocation]) {
    _localDatabase[databaseLocation] = Database(databaseLocation)
    _localDatabase[databaseLocation]!.exec('CREATE TABLE IF NOT EXISTS _development_cache (id TEXT PRIMARY KEY, checksum TEXT, parsedContent TEXT)')
  }

  return {
    fetchDevelopmentCache() {
      return _localDatabase[databaseLocation]!.prepare<unknown[], { id: string, checksum: string, parsedContent: string }>('SELECT * FROM _development_cache')
        .all()
        .reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {} as Record<string, { checksum: string, parsedContent: string }>)
    },
    fetchDevelopmentCacheForKey(key: string) {
      return _localDatabase[databaseLocation]!.prepare<unknown[], { id: string, checksum: string, parsedContent: string }>('SELECT * FROM _development_cache WHERE id = ?')
        .get(key)
    },
    insertDevelopmentCache(id: string, checksum: string, parsedContent: string) {
      this.deleteDevelopmentCache(id)
      _localDatabase[databaseLocation]!.exec(`INSERT INTO _development_cache (id, checksum, parsedContent) VALUES ('${id}', '${checksum}', '${parsedContent.replace(/'/g, '\'\'')}')`)
    },
    deleteDevelopmentCache(id: string) {
      _localDatabase[databaseLocation]!.exec(`DELETE FROM _development_cache WHERE id = '${id}'`)
    },
    exec: (sql: string) => {
      _localDatabase[databaseLocation]!.exec(sql)
    },
    close: () => {
      _localDatabase[databaseLocation]!.close()
      _localDatabase[databaseLocation] = undefined
    },
  }
}

export function* chunks<T>(arr: T[], size: number): Generator<T[], void, unknown> {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size)
  }
}
