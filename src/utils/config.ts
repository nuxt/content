import { loadConfig, watchConfig, createDefineConfig } from 'c12'
import { relative } from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import type { DefinedCollection } from '../types'
import { defineCollection, resolveCollections } from './collection'
import { logger } from './dev'

type NuxtContentConfig = {
  collections: Record<string, DefinedCollection>
}

const defaultConfig: NuxtContentConfig = {
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*',
    }),
  },
}

export const defineContentConfig = createDefineConfig<NuxtContentConfig>()

export async function loadContentConfig(nuxt: Nuxt, options: { defaultFallback?: boolean } = {}) {
  const loader: typeof watchConfig = nuxt.options.dev
    ? opts => watchConfig({
      ...opts,
      onWatch: (e) => {
        logger.info(relative(nuxt.options.rootDir, e.path) + ' ' + e.type + ', restarting the Nuxt server...')
        nuxt.hooks.callHook('restart', { hard: true })
      },
    })
    : loadConfig as typeof watchConfig;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).defineContentConfig = (c: any) => c

  const contentConfigs = await Promise.all(
    nuxt.options._layers.reverse().map(
      layer => loader<NuxtContentConfig>({ name: 'content', cwd: layer.config.rootDir, defaultConfig: options.defaultFallback ? defaultConfig : undefined }),
    ),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).defineContentConfig

  if (nuxt.options.dev) {
    nuxt.hook('close', () => Promise.all(contentConfigs.map(c => c.unwatch())).then(() => {}))
  }

  const collectionsConfig = contentConfigs.reduce((acc, curr) => ({ ...acc, ...curr.config?.collections }), {} as Record<string, DefinedCollection>)
  const hasNoCollections = Object.keys(collectionsConfig || {}).length === 0

  if (hasNoCollections) {
    logger.warn('No content configuration found, falling back to default collection. In order to have full control over your collections, create the config file in project root. See: https://content.nuxt.com/getting-started/installation')
  }

  const collections = resolveCollections(hasNoCollections ? defaultConfig.collections : collectionsConfig)

  return { collections }
}
