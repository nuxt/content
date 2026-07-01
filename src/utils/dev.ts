import { createUnplugin } from 'unplugin'
import type { ViteDevServer } from 'vite'
import crypto from 'node:crypto'
import { cp, mkdir, readFile, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import { isIgnored, updateTemplates, useLogger } from '@nuxt/kit'
import type { ConsolaInstance } from 'consola'
import chokidar from 'chokidar'
import micromatch from 'micromatch'
import { withTrailingSlash } from 'ufo'
import type { ModuleOptions, ResolvedCollection } from '../types'
import type { Manifest } from '../types/manifest'
import { getLocalDatabase } from './database'
import { generateCollectionInsert } from './collection'
import { createParser } from './content'
import { moduleTemplates } from './templates'
import { getExcludedSourcePaths, parseSourceBase } from './source'
import { assetIndexKey, assetPublicUrl, getAssetSize } from './assets/discover'
import { isAssetExtension } from './assets/paths'
import { isImage, type AssetIndex, type ContentReference, type ImageSizeHint, type UnresolvedIndex } from './assets/shared'
import { createHooks } from 'hookable'

export const logger: ConsolaInstance = useLogger('@nuxt/content')

export const contentHooks = createHooks<{
  'hmr:content:update': (data: { key: string, collection: string, queries: string[] }) => void
  'hmr:assets:update': (data: { event: 'update' | 'remove', src: string, width?: number, height?: number }) => void
}>()

export interface DevAssetsConfig {
  index: AssetIndex
  unresolved: UnresolvedIndex
  publicDir: string
  imageSizes: ImageSizeHint[]
  prefix: string
  blankLinks: boolean
  extensions: string[]
  debug: boolean
}

interface HMRPluginOptions {
  nuxt: Nuxt
  moduleOptions: ModuleOptions
  manifest: Manifest
  assets: DevAssetsConfig | null
}

export const NuxtContentHMRUnplugin = createUnplugin((opts: HMRPluginOptions) => {
  const { nuxt, moduleOptions, manifest, assets } = opts
  const componentsTemplatePath = join(nuxt.options.buildDir, 'content/components.ts')

  watchContents(nuxt, moduleOptions, manifest, assets)
  watchComponents(nuxt)

  return {
    name: 'nuxt-content-hmr-unplugin',
    vite: {
      configureServer(server: ViteDevServer) {
        server.watcher.on('change', (file) => {
          if (file === componentsTemplatePath) {
            return server.ws.send({ type: 'full-reload' })
          }
        })

        contentHooks.hook('hmr:content:update', (data) => {
          server.ws.send({
            type: 'custom',
            event: 'nuxt-content:update',
            data,
          })
        })

        contentHooks.hook('hmr:assets:update', (data) => {
          server.ws.send({
            type: 'custom',
            event: 'nuxt-content:assets:update',
            data,
          })
        })
      },
    },
  }
})

export function watchContents(nuxt: Nuxt, options: ModuleOptions, manifest: Manifest, assets: DevAssetsConfig | null = null) {
  const collectionParsers = {} as Record<string, Awaited<ReturnType<typeof createParser>>>

  const collections = manifest.collections
  let db: Awaited<ReturnType<typeof getLocalDatabase>>
  async function getDb() {
    if (!db) {
      db = await getLocalDatabase(options._localDatabase!, { nativeSqlite: options.experimental?.nativeSqlite })
    }
    return db
  }

  const sourceMap = collections.flatMap((c) => {
    if (c.source) {
      return c.source.filter(s => !s.repository).map((s) => {
        const { fixed } = parseSourceBase(s)
        return { collection: c, source: s, cwd: s.cwd && withTrailingSlash(s.cwd), prefix: s.cwd && withTrailingSlash(join(s.cwd, fixed)) }
      })
    }
    return []
  }).filter(({ source }) => source.cwd)

  const dirsToWatch = Array.from(new Set(sourceMap.map(({ prefix }) => prefix)))
    // Filter out empty cwd for custom collections
    .filter(Boolean)

  const watcher = chokidar.watch(dirsToWatch, {
    ignoreInitial: true,
    ignored: (path) => {
      const match = sourceMap.find(({ source, cwd, prefix }) => {
        if (withTrailingSlash(path) === prefix) return true
        if (prefix && path.startsWith(prefix)) {
          return micromatch.isMatch(
            path.substring(cwd.length),
            '**',
            { ignore: getExcludedSourcePaths(source), dot: true },
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
    const absolutePath = resolve(pathOrError as string)
    // Handle assets before the content match: a `**` source would otherwise
    // match them as content.
    if (assets && isAssetExtension(absolutePath)) {
      await onAssetChange('update', absolutePath, assets)
      return
    }
    const matches = sourceMap.filter(({ source, cwd }) => {
      if (cwd && absolutePath.startsWith(cwd)) {
        return micromatch.isMatch(absolutePath.substring(cwd.length), source!.include, { ignore: source!.exclude || [], dot: true })
      }

      return false
    })
    if (matches.length) {
      const db = await getDb()

      let content: string | undefined
      for (const match of matches) {
        const { collection, source, cwd } = match
        const path = absolutePath.substring(cwd.length)
        logger.info(`File \`${path}\` changed on \`${collection.name}\` collection`)
        const { fixed } = parseSourceBase(source)

        const filePath = path.substring(fixed.length)
        const keyInCollection = join(collection.name, source?.prefix || '', filePath)
        const fullPath = join(cwd, path)

        if (content === undefined) {
          content = await readFile(fullPath, 'utf8')
          if (content === '') {
            // If users edit the file very quickly, in some race-condition, the file content might be read as empty.
            // To deal with this scenario, we wait for 50ms if the file is empty and try again.
            content = await new Promise<string>(resolve => setTimeout(resolve, 50))
              .then(() => readFile(fullPath, 'utf8'))
          }
        }

        const checksum = getContentChecksum(content!)
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
            body: content!,
            path: fullPath,
            collectionType: collection.type,
          }).then(result => JSON.stringify(result))

          db.insertDevelopmentCache(keyInCollection, parsedContent, checksum)
        }

        const { queries: insertQuery } = generateCollectionInsert(collection, JSON.parse(parsedContent))
        await broadcast(collection, keyInCollection, insertQuery)
      }
    }
  }

  async function onRemove(pathOrError: string | Error) {
    if (pathOrError instanceof Error) {
      return
    }
    // resolve path using `pathe.resolve` to use `/` instead of `\` on windows, otherwise `micromatch` will not match
    const absolutePath = resolve(pathOrError as string)
    if (assets && isAssetExtension(absolutePath)) {
      await onAssetChange('remove', absolutePath, assets)
      return
    }
    const matches = sourceMap.filter(({ source, cwd }) => {
      if (cwd && absolutePath.startsWith(cwd)) {
        return micromatch.isMatch(absolutePath.substring(cwd.length), source!.include, { ignore: source!.exclude || [], dot: true })
      }

      return false
    })
    if (matches.length) {
      const db = await getDb()
      for (const match of matches) {
        const { collection, source, cwd } = match
        const path = absolutePath.substring(cwd.length)
        logger.info(`File \`${path}\` removed from \`${collection.name}\` collection`)
        const { fixed } = parseSourceBase(source)

        const filePath = path.substring(fixed.length)
        const keyInCollection = join(collection.name, source?.prefix || '', filePath)

        await db.deleteDevelopmentCache(keyInCollection)

        await broadcast(collection, keyInCollection)
      }
    }
  }

  async function broadcast(collection: ResolvedCollection, key: string, insertQuery?: string[]) {
    const db = await getDb()
    const removeQuery = `DELETE FROM ${collection.tableName} WHERE id = '${key.replace(/'/g, '\'\'')}';`
    await db.exec(removeQuery)
    if (insertQuery) {
      await Promise.all(insertQuery.map(query => db.exec(query)))
    }

    const collectionDump = manifest.dump[collection.name]!
    const keyIndex = collectionDump.findIndex(item => item.includes(`'${key}'`))
    const indexToUpdate = keyIndex !== -1 ? keyIndex : collectionDump.length
    const itemsToRemove = keyIndex === -1 ? 0 : 1

    if (insertQuery) {
      collectionDump.splice(indexToUpdate, itemsToRemove, ...insertQuery)
    }
    else {
      collectionDump.splice(indexToUpdate, itemsToRemove)
    }

    updateTemplates({
      filter: template => [
        moduleTemplates.manifest,
        moduleTemplates.fullCompressedDump,
        // moduleTemplates.raw,
      ].includes(template.filename),
    })

    contentHooks.callHook('hmr:content:update', {
      key,
      collection: collection.name,
      queries: insertQuery ? [removeQuery, ...insertQuery] : [removeQuery],
    })
  }

  async function reparseReferencingContent(references: ContentReference[]) {
    const db = await getDb()
    const seen = new Set<string>()
    for (const reference of references) {
      if (seen.has(reference.id)) {
        continue
      }
      seen.add(reference.id)
      const collection = collections.find(c => c.name === reference.collection)
      if (!collection) {
        continue
      }
      const body = await readFile(reference.path, 'utf8').catch((): string => '')
      if (!body) {
        continue
      }
      if (!collectionParsers[collection.name]) {
        collectionParsers[collection.name] = await createParser(collection, nuxt)
      }
      const parsed = await collectionParsers[collection.name]!({
        id: reference.id,
        body,
        path: reference.path,
        collectionType: collection.type,
      }).then(result => JSON.stringify(result))
      db.insertDevelopmentCache(reference.id, parsed, getContentChecksum(body))
      const { queries } = generateCollectionInsert(collection, JSON.parse(parsed))
      await broadcast(collection, reference.id, queries)
    }
  }

  async function onAssetChange(event: 'update' | 'remove', absolutePath: string, assets: DevAssetsConfig) {
    const match = sourceMap.find(({ cwd }) => cwd && absolutePath.startsWith(cwd))
    if (!match) {
      return
    }
    const { source } = match
    const { fixed } = parseSourceBase(source)
    const scanDir = join(match.cwd, fixed)
    const relativeKey = absolutePath.substring(scanDir.length).replace(/^\//, '')
    const indexKey = assetIndexKey(absolutePath)
    const url = assetPublicUrl(relativeKey, source.prefix || '', assets.prefix)
    const target = join(assets.publicDir, url)

    if (event === 'remove') {
      await rm(target, { force: true }).catch(() => {})
      assets.index.delete(indexKey)
      contentHooks.callHook('hmr:assets:update', { event: 'remove', src: url })
      return
    }

    const previous = assets.index.get(indexKey)
    await mkdir(dirname(target), { recursive: true })
    await cp(absolutePath, target)
    const { width, height } = assets.imageSizes.length && isImage(absolutePath) ? await getAssetSize(absolutePath) : {}
    assets.index.set(indexKey, { publicSrc: url, width, height, content: previous?.content || [] })

    // Re-parse content affected by this asset: a resize changes injected
    // dimensions, and a first appearance resolves earlier dangling references.
    const toReparse: ContentReference[] = []
    if (previous && (previous.width !== width || previous.height !== height)) {
      toReparse.push(...previous.content)
    }
    const pending = assets.unresolved.get(indexKey)
    if (pending?.length) {
      toReparse.push(...pending)
      assets.unresolved.delete(indexKey)
    }
    if (toReparse.length) {
      await reparseReferencingContent(toReparse)
    }
    contentHooks.callHook('hmr:assets:update', { event: 'update', src: url, width, height })
  }

  nuxt.hook('close', async () => {
    if (watcher) {
      watcher.removeAllListeners()
      watcher.close()
      db?.close()
    }
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
