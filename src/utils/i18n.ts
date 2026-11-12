import { createDefu } from 'defu'
import { extname } from 'pathe'
import { hash } from 'ohash'
import type { CollectionI18nConfig } from '../types/collection'
import { logger } from './dev'
import type { ParsedContentFile } from '../types'

/**
 * Override keys that are never applied. Identity fields keep the `(locale, stem)`
 * pairing intact, `meta` carries the source hash, `i18n` cannot nest, and
 * prototype keys could make other fields appear in the overrides.
 */
const IGNORED_OVERRIDE_KEYS = ['id', 'stem', 'path', 'locale', 'extension', 'meta', 'i18n', '__proto__', 'constructor', 'prototype']

/**
 * Fields a content parser produces from the file itself, such as the sanitized
 * Markdown AST. Only raw data formats store them as written, so only those may
 * override them. Elsewhere an override would bypass parsing and sanitization.
 */
const PARSED_FIELDS = ['body', 'excerpt']
// Matched against `extname(id)`, which is how a parser is chosen. Rows of a CSV
// file get a `#<row>` suffix.
const RAW_DATA_EXTENSION = /^\.(?:ya?ml|json5?|csv(?:#\d+)?)$/i

/** `meta` field of locale items that holds the hash of the source values they translate. */
const SOURCE_HASH_FIELD = '_i18nSourceHash'

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Merge two arrays item by item. Override items take priority and default items
 * fill any gaps. Arrays of plain values replace the default wholesale (including
 * an empty array, which clears the list), since pad-filling a shorter
 * locale-specific list from the default tail is virtually never intended.
 * Object items deep-merge, and nested arrays merge by index recursively.
 */
function mergeArraysByIndex(overrideArr: unknown[], defaultArr: unknown[]): unknown[] {
  const isScalarOverride = overrideArr.every(item => typeof item !== 'object' || item === null)
  if (isScalarOverride) {
    return [...overrideArr]
  }

  const maxLen = Math.max(overrideArr.length, defaultArr.length)
  const result: unknown[] = []
  for (let i = 0; i < maxLen; i++) {
    const overrideItem = overrideArr[i]
    const defaultItem = defaultArr[i]
    if (Array.isArray(overrideItem) && Array.isArray(defaultItem)) {
      // Both items are themselves arrays. Recurse directly instead of delegating
      // to `defuByIndex`, whose merger only runs for arrays nested inside objects
      // and cannot take arrays as top-level arguments.
      result.push(mergeArraysByIndex(overrideItem, defaultItem))
    }
    else if (overrideItem !== undefined && defaultItem !== undefined
      && typeof overrideItem === 'object' && overrideItem !== null && !Array.isArray(overrideItem)
      && typeof defaultItem === 'object' && defaultItem !== null && !Array.isArray(defaultItem)) {
      result.push(defuByIndex(overrideItem, defaultItem))
    }
    else {
      // Like defu at object level, a null item keeps the default.
      result.push(overrideItem ?? defaultItem)
    }
  }
  return result
}

/**
 * Custom `defu` merger that combines arrays by index (item by item) instead of
 * concatenating. Applied recursively to all nested arrays within merged objects.
 *
 * Used for inline i18n expansion. Arrays of objects (such as nav items or cards)
 * deep-merge so untranslated fields (routes, IDs, icons, URLs) are preserved from
 * the default.
 *
 * Inside `createDefu`'s merger, `obj[key]` is the defaults (second arg) and
 * `value` is the overrides (first arg).
 */
export const defuByIndex = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    ;(obj as Record<string, unknown>)[key as string] = mergeArraysByIndex(value as unknown[], obj[key] as unknown[])
    return true
  }
})

/**
 * Pick the default-locale values that correspond to the leaf paths a locale
 * override actually translates. Walks the override structure and copies only the
 * matching leaves from the source, so a translation of `info.country` captures
 * the default `info.country` rather than the whole `info` object. This keeps the
 * per-locale source hash from flipping when an untranslated sibling field changes.
 */
function pickSourceByOverride(source: unknown, override: unknown): unknown {
  // Arrays of objects merge by index, so their items are picked by index too.
  if (Array.isArray(override) && Array.isArray(source) && override.some(item => typeof item === 'object' && item !== null)) {
    return override.map((item, index) => pickSourceByOverride(source[index], item))
  }
  if (override && typeof override === 'object' && !Array.isArray(override)
    && source && typeof source === 'object' && !Array.isArray(source)) {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(override as Record<string, unknown>)) {
      out[k] = pickSourceByOverride((source as Record<string, unknown>)[k], (override as Record<string, unknown>)[k])
    }
    return out
  }
  return source
}

/**
 * Expand the inline `i18n` section of a parsed file into one item per locale.
 *
 * The source item keeps its own values and locale. Each other locale gets a deep
 * merge of its overrides onto the source item: arrays merge by index (see
 * `defuByIndex`), schema fields override columns, and other fields override
 * `meta`, where the parser stores them. Locale items record a hash of the source
 * values they translate in `meta._i18nSourceHash`, so tooling can spot outdated
 * translations.
 *
 * `body` and `excerpt` can only be translated inline in raw data formats (YAML,
 * JSON, CSV). Markdown and other parsed formats produce sanitized ASTs that an
 * override would bypass. Page bodies are replaced wholesale.
 *
 * Mutates `parsedContent`: removes `meta.i18n` and sets a missing `locale`.
 */
export function expandI18nData(
  parsedContent: ParsedContentFile,
  i18nConfig: CollectionI18nConfig,
  collectionType?: 'page' | 'data',
  schemaKeys?: string[],
): ParsedContentFile[] {
  parsedContent.locale ||= i18nConfig.defaultLocale

  const { i18n: i18nData, ...meta } = (parsedContent.meta || {}) as Record<string, unknown>
  if (i18nData === undefined || i18nData === null) {
    return [parsedContent]
  }
  parsedContent.meta = meta

  if (!isPlainObject(i18nData)) {
    logger.warn(`Inline i18n in "${parsedContent.id}" is ignored, it must be an object keyed by locale.`)
    return [parsedContent]
  }

  const items: ParsedContentFile[] = [parsedContent]
  for (const [locale, block] of Object.entries(i18nData)) {
    // An empty block is a placeholder for a translation that does not exist yet.
    if (block === null || block === undefined) {
      continue
    }
    if (!isPlainObject(block)) {
      logger.warn(`Inline i18n in "${parsedContent.id}" for locale "${locale}" is ignored, it must be an object.`)
      continue
    }
    if (locale === parsedContent.locale) {
      const values = { ...meta, ...parsedContent }
      if (hash(pickSourceByOverride(values, block)) !== hash(block)) {
        logger.warn(
          `Inline i18n in "${parsedContent.id}" has a block for its own locale "${locale}", which is ignored. `
          + 'Top-level values apply to this locale.',
        )
      }
      continue
    }
    if (!i18nConfig.locales.includes(locale)) {
      logger.warn(
        `Inline i18n in "${parsedContent.id}" defines locale "${locale}" which is not in the collection's `
        + `locales [${i18nConfig.locales.map(l => `"${l}"`).join(', ')}]. This translation is ignored.`,
      )
      continue
    }

    try {
      items.push(expandLocale(parsedContent, meta, locale, block, collectionType, schemaKeys))
    }
    catch (error) {
      logger.warn(
        `Inline i18n in "${parsedContent.id}" for locale "${locale}" is ignored: `
        + (error instanceof Error ? error.message : String(error)),
      )
    }
  }

  return items
}

function expandLocale(
  source: ParsedContentFile,
  meta: Record<string, unknown>,
  locale: string,
  block: Record<string, unknown>,
  collectionType: 'page' | 'data' | undefined,
  schemaKeys: string[] | undefined,
): ParsedContentFile {
  const columns: Record<string, unknown> = {}
  const metaOverrides: Record<string, unknown> = {}
  for (const [field, value] of Object.entries(block)) {
    if (IGNORED_OVERRIDE_KEYS.includes(field)) {
      continue
    }
    // The id comes from the file name and cannot be changed by the content.
    if (PARSED_FIELDS.includes(field) && !RAW_DATA_EXTENSION.test(extname(source.id))) {
      logger.warn(
        `Inline i18n in "${source.id}" translates \`${field}\` for locale "${locale}", which is ignored because `
        + 'this format parses it from the file. Use a separate file per locale to translate it.',
      )
      continue
    }
    if (!schemaKeys || schemaKeys.includes(field)) {
      columns[field] = value
    }
    else {
      metaOverrides[field] = value
    }
  }

  // The hash only covers the source values of the leaves this locale translates,
  // so editing an untranslated sibling field does not mark the translation outdated.
  const sourceValues: Record<string, unknown> = {}
  for (const [field, value] of Object.entries(columns)) {
    sourceValues[field] = pickSourceByOverride(source[field], value)
  }
  for (const [field, value] of Object.entries(metaOverrides)) {
    sourceValues[field] = pickSourceByOverride(meta[field], value)
  }

  const item = defuByIndex(columns, source) as ParsedContentFile
  if (collectionType === 'page') {
    if (Object.hasOwn(columns, 'body')) {
      item.body = columns.body as ParsedContentFile['body']
    }
    translateDerivedSeo(item, source, columns)
  }

  return {
    ...item,
    id: `${source.id}#${locale}`,
    locale,
    meta: { ...defuByIndex(metaOverrides, meta), [SOURCE_HASH_FIELD]: hash(sourceValues) },
  }
}

/**
 * The parser fills `seo.title` and `seo.description` from `title` and `description`
 * before expansion. Derive them again from the translated values, unless the source
 * sets its own `seo` value or the locale translates `seo` itself.
 */
function translateDerivedSeo(item: ParsedContentFile, source: ParsedContentFile, columns: Record<string, unknown>) {
  if (!isPlainObject(source.seo)) {
    return
  }
  const seoOverride = isPlainObject(columns.seo) ? columns.seo : {}
  const seo: Record<string, unknown> = {}
  for (const field of ['title', 'description']) {
    if (Object.hasOwn(columns, field) && !Object.hasOwn(seoOverride, field) && source.seo[field] === source[field]) {
      seo[field] = item[field]
    }
  }
  if (Object.keys(seo).length > 0) {
    item.seo = { ...(item.seo as Record<string, unknown>), ...seo }
  }
}

/**
 * Track the `(locale, stem)` pairs of a collection's rows and warn when two rows
 * share one, for example an inline translation and a file in a locale directory.
 * Fallback queries and `queryCollectionLocales` would return both.
 */
export function createLocaleVariantTracker(collection: string) {
  const seen = new Map<string, string>()
  return (item: ParsedContentFile) => {
    const key = JSON.stringify([item.locale, item.stem])
    const existing = seen.get(key)
    if (existing === undefined) {
      seen.set(key, item.id)
      return
    }
    logger.warn(
      `"${existing}" and "${item.id}" in collection "${collection}" are both the "${item.locale}" version of `
      + `"${item.stem}". Keep only one of them.`,
    )
  }
}

/**
 * Find the locale directory among the first `maxIndex + 1` segments of a stem or
 * source prefix. Directory names match locale codes case-insensitively, since
 * generated paths are lowercased.
 */
export function findLocaleSegment(segments: string[], locales: string[], maxIndex: number): { index: number, locale: string } | undefined {
  for (let index = 0; index <= Math.min(maxIndex, segments.length - 1); index++) {
    const segment = segments[index]!.toLowerCase()
    const locale = locales.find(locale => locale.toLowerCase() === segment)
    if (locale) {
      return { index, locale }
    }
  }
}

/**
 * Detect the locale from the locale directory in a content stem and remove that
 * directory from `stem` and `path`. The directory can be any segment of the
 * source prefix or the first one after it. The stem is used because a custom
 * front-matter `path` never changes it. Returns the default locale when the stem
 * has no locale directory.
 */
export function detectLocaleFromPath(
  path: string,
  stem: string,
  i18nConfig: CollectionI18nConfig,
  sourcePrefix: string = '',
): { locale: string, path: string, stem: string } {
  const stemParts = stem.split('/').filter(Boolean)
  // Only directories name a locale, the last segment is the file name.
  const match = findLocaleSegment(stemParts.slice(0, -1), i18nConfig.locales, sourcePrefix.split('/').filter(Boolean).length)
  if (!match) {
    return { locale: i18nConfig.defaultLocale, path, stem }
  }

  const { index, locale } = match
  const pathParts = path.split('/').filter(Boolean)
  // A custom front-matter path without the locale directory is left untouched.
  const strippedPath = pathParts[index]?.toLowerCase() === stemParts[index]!.toLowerCase()
    ? '/' + pathParts.filter((_, i) => i !== index).join('/')
    : path

  return {
    locale,
    path: strippedPath,
    stem: stemParts.filter((_, i) => i !== index).join('/'),
  }
}
