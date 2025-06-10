import crypto from 'node:crypto'
import { readFile } from 'node:fs/promises'
import type { IncomingMessage } from 'node:http'
import { join, resolve } from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import { addVitePlugin, isIgnored, updateTemplates, useLogger } from '@nuxt/kit'
import type { ConsolaInstance } from 'consola'
import chokidar from 'chokidar'
import micromatch from 'micromatch'
import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import { listen, type Listener } from 'listhen'
import { withTrailingSlash } from 'ufo'
import type { ModuleOptions, ResolvedCollection } from '../types'
import type { Manifest } from '../types/manifest'
import { getLocalDatabase } from './database'
import { generateCollectionInsert } from './collection'
import { createParser } from './content'
import { moduleTemplates } from './templates'
import { parseSourceBase } from './source'

export const logger: ConsolaInstance = useLogger('@nuxt/content')

export async function startSocketServer(nuxt: Nuxt, options: ModuleOptions, manifest: Manifest) {
  const db = await getLocalDatabase(options._localDatabase!, { nativeSqlite: options.experimental?.nativeSqlite })

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

  async function broadcast(collection: ResolvedCollection, key: string, insertQuery?: string[]) {
    const removeQuery = `DELETE FROM ${collection.tableName} WHERE id = '${key.replace(/'/g, '\'\'')}';`
    await db.exec(removeQuery)
    if (insertQuery) {
      await Promise.all(insertQuery.map(query => db.exec(query)))
    }

    const collectionDump = manifest.dump[collection.name]
    const keyIndex = collectionDump?.findIndex(item => item.includes(`'${key}'`))
    const indexToUpdate = keyIndex !== -1 ? keyIndex : collectionDump?.length
    const itemsToRemove = keyIndex === -1 ? 0 : 1

    if (insertQuery) {
      collectionDump?.splice(indexToUpdate, itemsToRemove, ...insertQuery)
    }
    else {
      collectionDump?.splice(indexToUpdate, itemsToRemove)
    }

    updateTemplates({
      filter: template => [
        moduleTemplates.manifest,
        moduleTemplates.fullCompressedDump,
        // moduleTemplates.raw,
      ].includes(template.filename),
    })

    websocket?.broadcast({
      key,
      collection: collection.name,
      queries: insertQuery ? [removeQuery, ...insertQuery] : [removeQuery],
    })
  }

  nuxt.hook('close', async () => {
    // Close WebSocket server
    await websocket?.close()
    await listener.server.close()
  })

  return {
    broadcast,
  }
}

export async function watchContents(nuxt: Nuxt, options: ModuleOptions, manifest: Manifest, socket: Awaited<ReturnType<typeof startSocketServer>>) {
  const collectionParsers = {} as Record<string, Awaited<ReturnType<typeof createParser>>>

  const db = await getLocalDatabase(options._localDatabase!, { nativeSqlite: options.experimental?.nativeSqlite })
  const collections = manifest.collections

  const sourceMap = collections.flatMap((c) => {
    if (c.source) {
      return c.source.filter(s => !s.repository).map((s) => {
        const { fixed } = parseSourceBase(s)
        return { collection: c, source: s, cwd: s.cwd && withTrailingSlash(s.cwd), prefix: s.cwd && withTrailingSlash(join(s.cwd, fixed)) }
      })
    }
    return []
  }).filter(({ source }) => source.cwd)

  const dirsToWatch = Array.from(new Set(sourceMap.map(({ source }) => source.cwd)))
    // Filter out empty cwd for custom collections
    .filter(Boolean)

  const watcher = chokidar.watch(dirsToWatch, {
    ignoreInitial: true,
    ignored: (path) => {
      const match = sourceMap.find(({ source, cwd, prefix }) => {
        if (path + '/' === prefix) return true
        if (prefix && path.startsWith(prefix)) {
          return micromatch.isMatch(
            path.substring(cwd.length),
            source.include,
            { ignore: source!.exclude || [], dot: true },
          )
        }

        return false
      })

      return !match
    },
  })

  watcher.on('add', onChange)
  watcher.on('change', onChange)
  watcher.on('unlink', onRemove)

  async function onChange(pathOrError: string | Error) {
    if (pathOrError instanceof Error) {
      return
    }
    // resolve path using `pathe.resolve` to use `/` instead of `\` on windows, otherwise `micromatch` will not match
    let path = resolve(pathOrError as string)
    const match = sourceMap.find(({ source, cwd }) => {
      if (cwd && path.startsWith(cwd)) {
        return micromatch.isMatch(path.substring(cwd.length), source!.include, { ignore: source!.exclude || [], dot: true })
      }

      return false
    })
    if (match) {
      const { collection, source, cwd } = match
      // Remove the cwd prefix
      path = path.substring(cwd.length)
      logger.info(`File \`${path}\` changed on \`${collection.name}\` collection`)
      const { fixed } = parseSourceBase(source)

      const filePath = path.substring(fixed.length)
      const keyInCollection = join(collection.name, source?.prefix || '', filePath)
      const fullPath = join(cwd, path)

      const content = await readFile(fullPath, 'utf8')
      const checksum = getContentChecksum(content)
      const localCache = await db.fetchDevelopmentCacheForKey(keyInCollection)

      let parsedContent = localCache?.value || ''

      // If the local cache is not present or the checksum does not match, we need to parse the content
      if (!localCache || localCache?.checksum !== checksum) {
        if (!collectionParsers[collection.name]) {
          collectionParsers[collection.name] = await createParser(collection, nuxt)
        }
        const parser = collectionParsers[collection.name]!
        parsedContent = await parser({
          id: keyInCollection,
          body: content,
          path: fullPath,
        }).then(result => JSON.stringify(result))

        db.insertDevelopmentCache(keyInCollection, checksum, parsedContent)
      }

      const { queries: insertQuery } = generateCollectionInsert(collection, JSON.parse(parsedContent))
      await socket.broadcast(collection, keyInCollection, insertQuery)
    }
  }

  async function onRemove(pathOrError: string | Error) {
    if (pathOrError instanceof Error) {
      return
    }
    // resolve path using `pathe.resolve` to use `/` instead of `\` on windows, otherwise `micromatch` will not match
    let path = resolve(pathOrError as string)
    const match = sourceMap.find(({ source, cwd }) => {
      if (cwd && path.startsWith(cwd)) {
        return micromatch.isMatch(path.substring(cwd.length), source!.include, { ignore: source!.exclude || [], dot: true })
      }

      return false
    })
    if (match) {
      const { collection, source, cwd } = match
      // Remove the cwd prefix
      path = path.substring(cwd.length)
      logger.info(`File \`${path}\` removed from \`${collection.name}\` collection`)
      const { fixed } = parseSourceBase(source)

      const filePath = path.substring(fixed.length)
      const keyInCollection = join(collection.name, source?.prefix || '', filePath)

      await db.deleteDevelopmentCache(keyInCollection)

      await socket.broadcast(collection, keyInCollection)
    }
  }

  nuxt.hook('close', async () => {
    watcher.close()
    db.close()
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

export function* chunks<T>(arr: T[], size: number): Generator<T[], void, unknown> {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size)
  }
}
