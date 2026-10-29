import { comarkContent, contentHub, type CacheArtifact, type ContentOptions, type ContentSource, type AnyComarkContent, type ContentHub } from 'comark-content'
import { withSnapshot } from 'comark-content/sources/snapshot'
import type { ComarkPlugin } from 'comark'
import toc from 'comark/plugins/toc'
import headings from 'comark/plugins/headings'
import { v3ServerPlugins } from '../v3/content-plugins.server'
import { highlight } from '#content/highlight'

export type ContentInstance = AnyComarkContent
// `ContentHub<any>`: a hub over a mutable instance array isn't assignable to the
// default `ContentHub<readonly AnyComarkContent[]>` (its `query` is invariant in T).
export type ContentSurface = ContentInstance | ContentHub<any>

interface NuxtContentOptions extends Omit<ContentOptions, 'source' | 'plugins'> {
  mode: 'server-only' | 'hybrid'
  /**
   * One source for a single Content instance (name defaults to `default`),
   * or a map of named sources composed through `contentHub()`.
   */
  source?: ContentSource
  sources?: Record<string, ContentSource>
  plugins?: ContentOptions['plugins']
  /**
   * Optional per-instance name when using a single `source`.
   * @default 'default'
   */
  name?: string
}

function snapshotLoaders(name: string) {
  // Prerendered artifacts are copied to server assets in both modes: the server
  // never requests them, since on serverless platforms public files only live on
  // the CDN and the request would reach the handler waiting for them.
  // While prerendering they don't exist yet: fall back to the origin source so
  // the handler can produce them.
  return {
    loadSnapshot: async () => {
      if (import.meta.prerender) return null
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - nitro auto-import (typed only under the Nitro tsconfig)
      return useStorage('assets:content').getItem(`${name}/snapshot.json`) as Promise<CacheArtifact | null>
    },
    loadManifest: async () => {
      if (import.meta.prerender) return null
      // Per-instance manifest: the merged hub manifest lists other instances'
      // items too, which hides this instance's documents once applied.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - nitro auto-import (typed only under the Nitro tsconfig)
      return useStorage('assets:content').getItem(`${name}/manifest.json`) as Promise<CacheArtifact | null>
    },
  }
}

function wrapSource(source: ContentSource, name: string): ContentSource {
  // Already a parsed/snapshot source — leave it alone.
  if (source && typeof source === 'object' && 'parsed' in source && (source as { parsed?: boolean }).parsed) {
    return source
  }

  const { loadSnapshot, loadManifest } = snapshotLoaders(name)
  return withSnapshot(source as Parameters<typeof withSnapshot>[0], loadSnapshot, loadManifest)
}

function createInstance(
  name: string,
  source: ContentSource,
  options: NuxtContentOptions,
  sharedPlugins: ContentOptions['plugins'],
) {
  const { mode: _mode, sources: _sources, source: _source, name: _name, plugins: _plugins, ...rest } = options

  return comarkContent(name, {
    ...rest,
    markdown: withDefaultPlugins(rest.markdown),
    basePath: '/__nuxt_content',
    source: wrapSource(source, name),
    plugins: [
      ...(options.plugins ?? []),
      ...(sharedPlugins ?? []),
    ],
  })
}

/**
 * Append the default Comark plugins (`toc`, configured through
 * `content.build.markdown.toc`, and `headings`) and the Shiki plugin configured
 * through `content.build.markdown.highlight`. A plugin the user already
 * registered under the same name is kept instead.
 */
function withDefaultPlugins(markdown: ContentOptions['markdown']): ContentOptions['markdown'] {
  const userPlugins = markdown?.plugins ?? []
  const defaults = [toc(import.meta.content.toc), headings(), highlight].filter((plugin): plugin is ComarkPlugin =>
    !!plugin && !userPlugins.some(({ name }) => name === plugin.name),
  )
  return { ...markdown, plugins: [...userPlugins, ...defaults] }
}

/**
 * Create a Nuxt Content surface backed by comark-content.
 *
 * Pass a single `source` for one instance, or `sources` for several named
 * instances composed with `contentHub()`. Production cold starts hydrate from
 * the prerendered snapshot via `withSnapshot()`.
 */
export function createNuxtContent(options: NuxtContentOptions): ContentSurface {
  // One shared plugin set (and therefore one SQLite database) across every
  // instance so hub FTS ranks correctly.
  const sharedPlugins = v3ServerPlugins()

  if (options.sources && Object.keys(options.sources).length > 0) {
    const instances = Object.entries(options.sources).map(([name, source]) =>
      createInstance(name, source, options, sharedPlugins),
    )
    return contentHub(instances, { basePath: '/__nuxt_content' })
  }

  if (!options.source) {
    throw new Error('createNuxtContent: pass `source` or `sources`.')
  }

  return createInstance(options.name ?? 'default', options.source, options, sharedPlugins)
}
