import type { ContentTransformer } from './types'

/**
 * Define new transformenr for content parsing.
 */
export function defineContentTransformer (transformer: ContentTransformer): ContentTransformer {
  return transformer
}

export { queryContent } from './server/storage'
export * from '#cotnent-transformers'
