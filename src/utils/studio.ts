import { z } from 'zod'
import type { Nuxt } from '@nuxt/schema'
import type { DefinedCollection } from '../types'
import { defineCollection } from './collection'

interface StudioAIConfig {
  apiKey?: string
  context?: {
    title?: string
    description?: string
    tone?: string
    style?: string
    collection?: {
      name?: string
      folder?: string
    }
  }
}

const DEFAULT_STUDIO_COLLECTION_NAME = 'studio'
const DEFAULT_STUDIO_COLLECTION_FOLDER = '.studio'

/**
 * Resolves studio collection configuration when nuxt-studio is installed.
 * Automatically creates a studio collection and adds exclude patterns to other collections.
 */
export function resolveStudioCollection(
  nuxt: Nuxt,
  collectionsConfig: Record<string, DefinedCollection>,
): void {
  /* @ts-expect-error - studio is not typed */
  const studioAIConfig: StudioAIConfig = nuxt.options.studio?.ai || {}
  if (!studioAIConfig.apiKey) {
    return
  }

  const studioCollectionName = studioAIConfig.context?.collection?.name || DEFAULT_STUDIO_COLLECTION_NAME
  const studioFolder = studioAIConfig.context?.collection?.folder || DEFAULT_STUDIO_COLLECTION_FOLDER
  const studioPattern = `${studioFolder}/**`

  // Add studio collection if it doesn't exist
  if (!collectionsConfig[studioCollectionName]) {
    collectionsConfig[studioCollectionName] = defineCollection({
      type: 'data',
      source: studioPattern,
      schema: z.object({
        rawbody: z.string(),
      }),
    })
  }

  // Add exclude pattern to all existing collections except studio
  for (const [name, collection] of Object.entries(collectionsConfig)) {
    if (name === studioCollectionName || !collection.source) {
      continue
    }

    // Add exclude pattern to each source
    for (const source of collection.source) {
      if (!source.exclude) {
        source.exclude = []
      }
      if (!source.exclude.includes(studioPattern)) {
        source.exclude.push(studioPattern)
      }
    }
  }
}
