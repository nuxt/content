import { join } from 'node:path'
import fastGlob from 'fast-glob'
import { createJiti } from 'jiti'
import type { DefinedCollection } from '../types'
import { defineCollection, resolveCollections } from './collection'
import { logger } from './dev'

const defaultConfig = {
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
    }),
  },
}

export async function loadContentConfig(rootDir: string, opts: { defaultFallback?: boolean } = {}) {
  const jiti = createJiti(rootDir)
  const configs = await fastGlob('content.config.*', { cwd: rootDir })
  const configPath = configs.length ? join(rootDir, configs[0]) : undefined

  if (!configPath && opts?.defaultFallback) {
    logger.warn('`content.config.ts` is not found, falling back to default collection. In order to have full control over your collections, create the config file in project root. See: https://content.nuxt.com/getting-started/installation')
    return {
      collections: resolveCollections(defaultConfig.collections, { rootDir }),
    }
  }

  const contentConfig = (configPath
    ? await jiti.import(configPath)
      .catch((err) => {
        console.error(err)
        return {}
      })
    : {}) as { collections: Record<string, DefinedCollection> }

  return {
    collections: resolveCollections(contentConfig.collections || {}, { rootDir }),
  }
}
