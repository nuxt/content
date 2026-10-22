import { comarkContent, contentHub, type CacheArtifact, type ContentOptions, type ContentSource, type AnyComarkContent, type ContentHub } from 'comark-content'
import { withSnapshot } from 'comark-content/sources/snapshot'
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

function snapshotLoaders(mode: 'server-only' | 'hybrid', name: string) {
  if (mode === 'server-only') {
    return {
      loadSnapshot: () =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - nitro auto-import (typed only under the Nitro tsconfig)
        useStorage('assets:content').getItem(`${name}/snapshot.json`) as Promise<CacheArtifact | null>,
      loadManifest: () =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - nitro auto-import (typed only under the Nitro tsconfig)
        useStorage('assets:content').getItem(`${name}/manifest.json`) as Promise<CacheArtifact | null>,
    }
  }

  // Hybrid mode hydrates from public prerendered artifacts. Never $fetch those
  // routes while they are themselves being generated (deadlocks Nitro prerender):
  // fall back to the origin source instead so the handler can produce them.
  return {
    loadSnapshot: async () => {
      if (import.meta.prerender) return null
      try {
        return await $fetch<CacheArtifact>(`/__nuxt_content/snapshot/${name}.json`)
      }
      catch {
        return null
      }
    },
    loadManifest: async () => {
      if (import.meta.prerender) return null
      try {
        // Per-instance manifest: the merged hub manifest lists other instances'
        // items too, which hides this instance's documents once applied.
        return await $fetch<CacheArtifact>(`/__nuxt_content/manifest/${name}.json`)
      }
      catch {
        return null
      }
    },
  }
}

function wrapSource(source: ContentSource, mode: 'server-only' | 'hybrid', name: string): ContentSource {
  // Already a parsed/snapshot source — leave it alone.
  if (source && typeof source === 'object' && 'parsed' in source && (source as { parsed?: boolean }).parsed) {
    return source
  }

  const { loadSnapshot, loadManifest } = snapshotLoaders(mode, name)
  return withSnapshot(source as Parameters<typeof withSnapshot>[0], loadSnapshot, loadManifest)
}

function createInstance(
  name: string,
  source: ContentSource,
  options: NuxtContentOptions,
  sharedPlugins: ContentOptions['plugins'],
) {
  const { mode, sources: _sources, source: _source, name: _name, plugins: _plugins, ...rest } = options

  return comarkContent(name, {
    ...rest,
    markdown: withHighlight(rest.markdown),
    basePath: '/__nuxt_content',
    source: wrapSource(source, mode, name),
    plugins: [
      ...(options.plugins ?? []),
      ...(sharedPlugins ?? []),
    ],
  })
}

/**
 * Append the Shiki plugin configured through `content.build.markdown.highlight`,
 * unless the user already registered one.
 */
function withHighlight(markdown: ContentOptions['markdown']): ContentOptions['markdown'] {
  const plugin = highlight
  if (!plugin || markdown?.plugins?.some(({ name }) => name === plugin.name)) return markdown
  return { ...markdown, plugins: [...(markdown?.plugins ?? []), plugin] }
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
