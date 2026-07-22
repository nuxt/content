export { metaStandardSchema, pageStandardSchema, property } from './schema'
export { defineCollection, defineCollectionSource } from './collection'
export { defineContentConfig } from './config'
export { defineTransformer } from './content/transformers/utils'

/**
 * The `meta` field name where inline-i18n expansion stores the source-content
 * hash on non-default-locale items. Exposed so tooling (Nuxt Studio, custom
 * translator pipelines) can detect outdated translations.
 */
export { I18N_SOURCE_HASH_FIELD } from '../types/locales'

/**
 * This is only for backward compatibility with Zod v3. Consider using direct import from 'zod' instead. This will be removed in the next major version.
 */
export { z } from './schema/zod3'
