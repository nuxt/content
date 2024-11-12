import { stat } from 'node:fs/promises'
import { loadConfig } from 'c12'
import type { Nuxt } from '@nuxt/schema'
import { join } from 'pathe'
import type { ResolvedCollection } from '../types'
import { defineCollection, resolveCollections } from './collection'
import { logger } from './dev'

const defaultConfig = {
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*',
    }),
  },
}

export async function loadContentConfig(rootDir: string, opts: { defaultFallback?: boolean } = {}) {
  const { config, configFile } = await loadConfig({ name: 'content', cwd: rootDir })

  if ((!configFile || configFile === 'content.config') && opts.defaultFallback) {
    logger.warn('`content.config.ts` is not found, falling back to default collection. In order to have full control over your collections, create the config file in project root. See: https://content.nuxt.com/getting-started/installation')
    return {
      collections: resolveCollections(defaultConfig.collections),
    }
  }

  return {
    collections: resolveCollections(config.collections || {}),
  }
}

export async function loadLayersConfig(nuxt: Nuxt) {
  const collectionMap = {} as Record<string, ResolvedCollection>
  const _layers = [...nuxt.options._layers].reverse()
  for (const layer of _layers) {
    const rootDir = layer.config.rootDir
    const configStat = await stat(join(rootDir, 'content.config.ts')).catch(() => null)
    if (configStat && configStat.isFile()) {
      const { collections } = await loadContentConfig(rootDir, { defaultFallback: false })
      for (const collection of collections) {
        collectionMap[collection.name] = collection
      }
    }
  }

  if (Object.keys(collectionMap).length === 0) {
    const collections = resolveCollections(defaultConfig.collections)
    for (const collection of collections) {
      collectionMap[collection.name] = collection
    }
  }

  return {
    collections: Object.values(collectionMap),
  }
}
