import { loadConfig, watchConfig, createDefineConfig } from 'c12'
import { relative } from 'pathe'
import { hasNuxtModule, useNuxt } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { CollectionI18nConfig, DefinedCollection, ModuleOptions } from '../types'
import { defineCollection, resolveCollections } from './collection'
import { localeStandardSchema, mergeStandardSchema } from './schema'
import { getCollectionFieldsTypes } from '../runtime/internal/schema'
import { logger } from './dev'
import { resolveStudioCollection } from './studio'

type NuxtContentConfig = {
  collections: Record<string, DefinedCollection>
}

const createDefaultCollections = (): NuxtContentConfig['collections'] => ({
  content: defineCollection({
    type: 'page',
    source: '**/*',
  }),
})

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

  const finalCollectionsConfig = hasNoCollections ? createDefaultCollections() : collectionsConfig

  // If nuxt-studio is installed, automatically configure studio collection
  if (hasNuxtModule('nuxt-studio', nuxt || useNuxt())) {
    resolveStudioCollection(nuxt, finalCollectionsConfig)
  }

  // Resolve `i18n: true` shorthand from @nuxtjs/i18n module config
  resolveI18nConfig(nuxt, finalCollectionsConfig)

  const collections = resolveCollections(finalCollectionsConfig)

  return { collections }
}

/**
 * Resolve `i18n: true` shorthand on collections by reading locale config
 * from the `@nuxtjs/i18n` module. If nuxt-i18n is not installed and a
 * collection uses `i18n: true`, a warning is logged and i18n is disabled.
 */
function resolveI18nConfig(nuxt: Nuxt, collections: Record<string, DefinedCollection>) {
  // Check which collections need resolution
  const needsResolution = Object.values(collections).some(c => c.i18n === true)
  if (!needsResolution) return

  let resolvedConfig: CollectionI18nConfig | undefined

  if (hasNuxtModule('@nuxtjs/i18n', nuxt)) {
    const i18nOptions = (nuxt.options as unknown as {
      i18n?: {
        locales?: Array<string | { code: string }>
        defaultLocale?: string
      }
    }).i18n

    if (i18nOptions?.locales?.length && i18nOptions.defaultLocale) {
      resolvedConfig = {
        locales: i18nOptions.locales.map(l => typeof l === 'string' ? l : l.code),
        defaultLocale: i18nOptions.defaultLocale,
      }
    }
  }

  for (const [name, collection] of Object.entries(collections)) {
    if (collection.i18n !== true) continue

    if (resolvedConfig) {
      collection.i18n = resolvedConfig
      // `mergeStandardSchema` preserves user-declared fields via spread order
      // (user's properties win on collision), so a pre-existing `locale` field
      // on the schema keeps its type. Surface a warning so authors are aware
      // their declaration is the one being used and ensure it types as string.
      if (hasUserLocaleField(collection.extendedSchema)) {
        logger.warn(
          `Collection "${name}" already declares a \`locale\` field in its schema; the i18n integration is reusing it. `
          + 'Make sure your schema types it as `string` to match the auto-detected locale codes.',
        )
      }
      collection.extendedSchema = mergeStandardSchema(localeStandardSchema, collection.extendedSchema)
      collection.fields = getCollectionFieldsTypes(collection.extendedSchema)
      // Avoid duplicate `(locale, stem)` indexes if the user already declared one.
      const hasLocaleStemIndex = (collection.indexes || []).some(
        idx => idx.columns.length === 2 && idx.columns[0] === 'locale' && idx.columns[1] === 'stem',
      )
      if (!hasLocaleStemIndex) {
        collection.indexes = [...(collection.indexes || []), { columns: ['locale', 'stem'] }]
      }
    }
    else {
      logger.warn(
        `Collection "${name}" has \`i18n: true\` but @nuxtjs/i18n module is not installed or has no locales configured. `
        + 'Provide an explicit `i18n: { locales, defaultLocale }` config or install @nuxtjs/i18n.',
      )
      collection.i18n = undefined
    }
  }
}

/**
 * Detect whether the user's collection schema already declares a `locale` field.
 * When true, the i18n integration reuses that declaration rather than overwriting it.
 */
function hasUserLocaleField(extendedSchema: DefinedCollection['extendedSchema']): boolean {
  const props = extendedSchema?.definitions?.__SCHEMA__?.properties as Record<string, unknown> | undefined
  return Boolean(props && 'locale' in props)
}
