import { loadConfig, watchConfig, createDefineConfig } from 'c12'
import { relative } from 'pathe'
import { hasNuxtModule, useNuxt } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { CollectionI18nConfig, DefinedCollection, ModuleOptions } from '../types'
import { defineCollection, hasLocaleStemIndex, normalizeLocaleField, resolveCollections } from './collection'
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

interface RawI18nModuleOptions {
  locales?: Array<string | { code: string }>
  defaultLocale?: string
}

/**
 * Read `@nuxtjs/i18n` locale options. Prefers the resolved options on
 * `nuxt.options.i18n`, then falls back to inline options passed in the `modules`
 * array, which are present before `@nuxtjs/i18n` normalizes them. Locales
 * contributed only through layers or the module's own hooks may not be visible at
 * this point, in which case an explicit `i18n: { locales, defaultLocale }` config
 * is required.
 */
function readI18nModuleOptions(nuxt: Nuxt): RawI18nModuleOptions | undefined {
  const fromOptions = (nuxt.options as unknown as { i18n?: RawI18nModuleOptions }).i18n
  if (fromOptions?.locales?.length) {
    return fromOptions
  }
  const moduleEntry = (nuxt.options.modules || []).find(
    (m): m is [string, RawI18nModuleOptions] => Array.isArray(m) && m[0] === '@nuxtjs/i18n',
  )
  if (moduleEntry?.[1]?.locales?.length) {
    return moduleEntry[1]
  }
  return fromOptions
}

/**
 * Resolve `i18n: true` shorthand on collections by reading locale config
 * from the `@nuxtjs/i18n` module. If the module is not installed (or its locale
 * config cannot be read) and a collection uses `i18n: true`, a warning is logged
 * and i18n is disabled for that collection.
 */
function resolveI18nConfig(nuxt: Nuxt, collections: Record<string, DefinedCollection>) {
  // Check which collections need resolution
  const needsResolution = Object.values(collections).some(c => c.i18n === true)
  if (!needsResolution) return

  let resolvedConfig: CollectionI18nConfig | undefined
  let reason = '@nuxtjs/i18n module is not installed'

  if (hasNuxtModule('@nuxtjs/i18n', nuxt)) {
    const i18nOptions = readI18nModuleOptions(nuxt)

    if (!i18nOptions?.locales?.length) {
      reason = '@nuxtjs/i18n is installed but no `locales` could be read at this point'
    }
    else if (!i18nOptions.defaultLocale) {
      reason = '@nuxtjs/i18n is installed but has no `defaultLocale` configured'
    }
    else {
      const localeCodes = i18nOptions.locales.map(l => typeof l === 'string' ? l : l.code)
      // `@nuxtjs/i18n` permits `defaultLocale` outside `locales` (it falls
      // through at runtime), but for content filtering it is a footgun. Files
      // under `content/<defaultLocale>/` would never be path-detected. The
      // invariant is forced here so it cannot silently drift.
      resolvedConfig = {
        locales: localeCodes.includes(i18nOptions.defaultLocale)
          ? localeCodes
          : [i18nOptions.defaultLocale, ...localeCodes],
        defaultLocale: i18nOptions.defaultLocale,
      }
    }
  }

  for (const [name, collection] of Object.entries(collections)) {
    if (collection.i18n !== true) continue

    if (resolvedConfig) {
      collection.i18n = resolvedConfig
      collection.extendedSchema = mergeStandardSchema(localeStandardSchema, collection.extendedSchema)
      // A user-declared `locale` field wins the schema merge; force it to string
      // so it cannot produce invalid SQL.
      normalizeLocaleField(collection.extendedSchema, name)
      collection.fields = getCollectionFieldsTypes(collection.extendedSchema)
      // Shared with `defineCollection`'s explicit-config path so both routes
      // dedupe against a user-declared `(locale, stem)` composite index.
      if (!hasLocaleStemIndex(collection.indexes)) {
        collection.indexes = [...(collection.indexes || []), { columns: ['locale', 'stem'] }]
      }
    }
    else {
      logger.warn(
        `Collection "${name}" has \`i18n: true\` but ${reason}. `
        + 'Provide an explicit `i18n: { locales, defaultLocale }` config or configure @nuxtjs/i18n.',
      )
      collection.i18n = undefined
    }
  }
}
