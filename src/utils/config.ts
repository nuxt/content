import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { AnyComarkContent, ContentHub } from 'comark-content'
import { getLayerDirectories, useLogger } from '@nuxt/kit'
import { createJiti } from 'jiti'
import type { Nuxt } from 'nuxt/schema'
import type { ResolvedContentCollections } from '../runtime/v3/content-config'
import type { ResolvedHighlightOptions } from './highlight'
import type { ResolvedTocOptions } from './toc'

export type ImportContentOptions = {
  /** Collections resolved from the layers' v3 `content.config.ts` files. */
  collections?: ResolvedContentCollections
  /** Resolved `content.build.markdown.highlight`, `false` when disabled. */
  highlight?: ResolvedHighlightOptions | false
  /** Module-process implementation of the `#content/highlight` virtual module. */
  highlightPath?: string
  /** Resolved `content.build.markdown.toc`. */
  toc?: ResolvedTocOptions
  /** Heading tags resolved from `content.renderer.anchorLinks`. */
  anchorLinks?: string[]
  /** This module's `@nuxt/content/server` entry, so it resolves without going through `dist` (stubbed builds). */
  contentEntryPath?: string
}

function createContentJiti(rootDir: string, options: ImportContentOptions) {
  const babelJiti = createJiti(import.meta.url)
  return createJiti(import.meta.url, {
    tryNative: false,
    moduleCache: false,
    fsCache: false,
    alias: {
      ...(options.highlightPath ? { '#content/highlight': options.highlightPath } : {}),
      ...(options.contentEntryPath ? { '@nuxt/content/server': options.contentEntryPath } : {}),
    },
    transform: (opts) => {
      const source = opts.source
        .replace(/import\.meta\.rootDir/g, JSON.stringify(rootDir))
        .replace(/import\.meta\.content\.collections/g, JSON.stringify(options.collections ?? {}))
        .replace(/import\.meta\.content\.highlight/g, JSON.stringify(options.highlight ?? false))
        .replace(/import\.meta\.content\.toc/g, JSON.stringify(options.toc ?? {}))
        .replace(/import\.meta\.content\.anchorLinks/g, JSON.stringify(options.anchorLinks ?? []))
      return { code: babelJiti.transform({ ...opts, source }) }
    },
  })
}

export type ImportedContent = {
  /** Exported surface — a single instance or a hub. */
  content: AnyComarkContent | ContentHub
}

export async function importContent(rootDir: string, filename: string, options: ImportContentOptions = {}): Promise<ImportedContent> {
  const jiti = createContentJiti(rootDir, options)
  const mod = await jiti.import(filename) as Record<string, unknown>

  // Prefer a dedicated export, then common aliases.
  const content = (mod.content ?? mod.default ?? mod.hub) as ImportedContent['content'] | undefined
  if (!content || typeof content !== 'object') {
    throw new Error(`No content export found in ${filename}. Export \`content\` from your server content file.`)
  }
  return { content }
}

export type ContentEntry = {
  type: 'server'
  /** The `server/content.ts`, without its extension. */
  path: string
} | {
  type: 'config'
  /** v3 `content.config.ts` files, from lowest to highest priority. */
  paths: string[]
} | {
  type: 'fallback'
}

/** The first `app/<file>`, from the project then its layers by priority. */
export function resolveLayerAppFile(nuxt: Nuxt, file: string): string | undefined {
  return getLayerDirectories(nuxt).map(dirs => join(dirs.app, file)).find(path => existsSync(path))
}

/**
 * The first `server/content.ts`, from the project then its layers by priority.
 * Without one, the v3 `content.config.ts` of every layer, which `compatibilityVersion: 4` ignores.
 */
export function resolveContentEntry(nuxt: Nuxt, compatibilityVersion: 3 | 4): ContentEntry {
  const server = getLayerDirectories(nuxt).map(dirs => join(dirs.server, 'content.ts')).find(path => existsSync(path))
  const configs = resolveLayerContentConfigs(nuxt)
  if (compatibilityVersion === 4 && configs.length) {
    useLogger('@nuxt/content').warn(`\`content.config.ts\` is ignored with \`content.compatibilityVersion: 4\`, declare its sources in \`server/content.ts\`: ${configs.map(path => `\`${path}\``).join(', ')}`)
  }
  if (server) return { type: 'server', path: server.slice(0, -'.ts'.length) }
  if (compatibilityVersion === 3 && configs.length) return { type: 'config', paths: configs }
  return { type: 'fallback' }
}

/**
 * Collect the v3 `content.config.ts` of every layer, ordered from lowest to
 * highest priority (the project itself comes last) so later configs override
 * collections of the same name — matching v3's layer behaviour.
 */
function resolveLayerContentConfigs(nuxt: Nuxt): string[] {
  return [...nuxt.options._layers]
    .reverse()
    .map(layer => join(layer.config.rootDir, 'content.config.ts'))
    .filter((path, index, paths) => existsSync(path) && paths.indexOf(path) === index)
}
