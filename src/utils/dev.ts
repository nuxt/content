import { createUnplugin } from 'unplugin'
import type { ViteDevServer } from 'vite'
import crypto from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'pathe'
import { defuByIndex } from './i18n'
import type { Nuxt } from '@nuxt/schema'
import { isIgnored, updateTemplates, useLogger } from '@nuxt/kit'
import type { ConsolaInstance } from 'consola'
import chokidar from 'chokidar'
import micromatch from 'micromatch'
import { withTrailingSlash } from 'ufo'
import { hash } from 'ohash'
import type { ModuleOptions, ParsedContentFile, ResolvedCollection } from '../types'
import type { Manifest } from '../types/manifest'
import { getLocalDatabase } from './database'
import { generateCollectionInsert } from './collection'
import { createParser } from './content'
import { moduleTemplates } from './templates'
import { getExcludedSourcePaths, parseSourceBase } from './source'
import { createHooks } from 'hookable'

export const logger: ConsolaInstance = useLogger('@nuxt/content')

export const contentHooks = createHooks<{
  'hmr:content:update': (data: { key: string, collection: string, queries: string[] }) => void
}>()

interface HMRPluginOptions {
  nuxt: Nuxt
  moduleOptions: ModuleOptions
  manifest: Manifest
}

export const NuxtContentHMRUnplugin = createUnplugin((opts: HMRPluginOptions) => {
  const { nuxt, moduleOptions, manifest } = opts
  const componentsTemplatePath = join(nuxt.options.buildDir, 'content/components.ts')

  watchContents(nuxt, moduleOptions, manifest)
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
      },
    },
  }
})

export function watchContents(nuxt: Nuxt, options: ModuleOptions, manifest: Manifest) {
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
    let path = resolve(pathOrError as string)
    const match = sourceMap.find(({ source, cwd }) => {
      if (cwd && path.startsWith(cwd)) {
        return micromatch.isMatch(path.substring(cwd.length), source!.include, { ignore: source!.exclude || [], dot: true })
      }

      return false
    })
    if (match) {
      const db = await getDb()
      const { collection, source, cwd } = match
      // Remove the cwd prefix
      path = path.substring(cwd.length)
      logger.info(`File \`${path}\` changed on \`${collection.name}\` collection`)
      const { fixed } = parseSourceBase(source)

      const filePath = path.substring(fixed.length)
      const keyInCollection = join(collection.name, source?.prefix || '', filePath)
      const fullPath = join(cwd, path)

      let content = await readFile(fullPath, 'utf8')
      if (content === '') {
        // If users edit the file very quickly, in some race-condition, the file content might be read as empty.
        // To deal with this scenario, we wait for 50ms if the file is empty and try again.
        content = await new Promise<string>(resolve => setTimeout(resolve, 50))
          .then(() => readFile(fullPath, 'utf8'))
      }
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
          collectionType: collection.type,
        }).then(result => JSON.stringify(result))

        db.insertDevelopmentCache(keyInCollection, parsedContent, checksum)
      }

      const parsed: ParsedContentFile = JSON.parse(parsedContent)

      // i18n: expand inline translations to per-locale DB rows (same logic as processCollectionItems)
      if (collection.i18n && (parsed?.meta as Record<string, unknown>)?.i18n) {
        const i18nData = (parsed.meta as Record<string, unknown>).i18n as Record<string, Record<string, unknown>>
        const { i18n: _removed, ...cleanMeta } = parsed.meta as Record<string, unknown>
        parsed.meta = cleanMeta
        if (!parsed.locale) parsed.locale = collection.i18n.defaultLocale

        const translatedFields = new Set(Object.values(i18nData).flatMap(Object.keys))
        const sourceFields: Record<string, unknown> = {}
        for (const field of translatedFields) sourceFields[field] = parsed[field]
        const i18nSourceHash = hash(sourceFields)

        // Upsert default locale row
        const { queries: defaultQueries } = generateCollectionInsert(collection, parsed)
        await broadcast(collection, keyInCollection, defaultQueries)

        // Upsert each non-default locale row
        for (const [locale, overrides] of Object.entries(i18nData)) {
          if (locale === parsed.locale) continue
          const localeKey = `${keyInCollection}#${locale}`
          const merged = collection.type === 'data'
            ? defuByIndex(overrides, parsed) as ParsedContentFile
            : { ...parsed, ...overrides }
          const localeItem: ParsedContentFile = {
            ...merged,
            id: localeKey,
            locale,
            meta: { ...cleanMeta, _i18nSourceHash: i18nSourceHash },
          }
          const { queries: localeQueries } = generateCollectionInsert(collection, localeItem)
          await broadcast(collection, localeKey, localeQueries)
        }

        // Remove locale rows that are no longer in the i18n section
        for (const locale of collection.i18n.locales) {
          if (locale === parsed.locale || locale in i18nData) continue
          await broadcast(collection, `${keyInCollection}#${locale}`)
        }
      }
      else {
        const { queries: insertQuery } = generateCollectionInsert(collection, parsed)
        await broadcast(collection, keyInCollection, insertQuery)
      }
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
      const db = await getDb()
      const { collection, source, cwd } = match
      // Remove the cwd prefix
      path = path.substring(cwd.length)
      logger.info(`File \`${path}\` removed from \`${collection.name}\` collection`)
      const { fixed } = parseSourceBase(source)

      const filePath = path.substring(fixed.length)
      const keyInCollection = join(collection.name, source?.prefix || '', filePath)

      await db.deleteDevelopmentCache(keyInCollection)

      // Remove main row and all locale variant rows
      await broadcast(collection, keyInCollection)
      if (collection.i18n) {
        for (const locale of collection.i18n.locales) {
          await broadcast(collection, `${keyInCollection}#${locale}`)
        }
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
    // Use exact key match: look for the id as a complete SQL string literal ('key',) to avoid
    // substring matches (e.g., 'team.yml' matching 'team.yml#fr')
    const escapedKey = key.replace(/'/g, '\'\'')
    const keyIndex = collectionDump.findIndex(item => item.includes(`'${escapedKey}',`) || item.endsWith(`'${escapedKey}')`))
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
