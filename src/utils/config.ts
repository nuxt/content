import { loadConfig, watchConfig, createDefineConfig } from 'c12'
import { relative } from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import type { DefinedCollection, ModuleOptions } from '../types'
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

export async function loadContentConfig(nuxt: Nuxt, options?: ModuleOptions) {
  const watch = nuxt.options.dev && options?.watch?.enabled !== false
  const loader: typeof watchConfig = watch
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

  const layers = [...nuxt.options._layers].reverse()
  const contentConfigs = await Promise.all(
    layers.map(
      layer => loader<NuxtContentConfig>({ name: 'content', cwd: layer.config.rootDir, defaultConfig: { collections: {} } }),
    ),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).defineContentConfig

  if (watch) {
    nuxt.hook('close', () => Promise.all(contentConfigs.map(c => c.unwatch())).then(() => {}))
  }

  const collectionsConfig = contentConfigs.reduce((acc, curr) => {
    const layerCollections = curr.config?.collections || {}
    const cwd = curr.cwd!

    Object.entries(layerCollections).forEach(([name, collection]) => {
      // @ts-expect-error - `__rootDir` is a private property to store the layer's cwd
      collection.__rootDir = cwd

      acc[name] = collection
    })

    return acc
  }, {} as Record<string, DefinedCollection>)

  const hasNoCollections = Object.keys(collectionsConfig || {}).length === 0
  if (hasNoCollections) {
    logger.warn('No content configuration found, falling back to default collection. In order to have full control over your collections, create the config file in project root. See: https://content.nuxt.com/docs/getting-started/installation')
  }

  const collections = resolveCollections(hasNoCollections ? defaultConfig.collections : collectionsConfig)

  return { collections }
}
