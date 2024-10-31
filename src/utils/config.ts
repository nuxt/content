import { loadConfig } from 'c12'
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
  const { config, configFile } = await loadConfig({ name: 'content', cwd: rootDir, defaultConfig })

  if (!configFile && opts?.defaultFallback) {
    logger.warn('`content.config.ts` is not found, falling back to default collection. In order to have full control over your collections, create the config file in project root. See: https://content.nuxt.com/getting-started/installation')
    return {
      collections: resolveCollections(defaultConfig.collections, { rootDir }),
    }
  }

  return {
    collections: resolveCollections(config.collections || {}, { rootDir }),
  }
}
