import { createDefu } from 'defu'
import { extname } from 'pathe'
import { hash } from 'ohash'
import type { CollectionI18nConfig } from '../types/collection'
import { logger } from './dev'
import type { ParsedContentFile } from '../types'

/**
 * Identity fields keep the `(locale, stem)` pairing intact, `meta` carries the source
 * hash, `i18n` cannot nest, and prototype keys could make other fields appear in the
 * overrides.
 */
const IGNORED_OVERRIDE_KEYS = ['id', 'stem', 'path', 'locale', 'extension', 'meta', 'i18n', '__proto__', 'constructor', 'prototype']

/**
 * Fields a parser builds from the file, such as the sanitized Markdown AST. Only raw data
 * formats store them as written. Elsewhere an override would bypass parsing and sanitization.
 */
const PARSED_FIELDS = ['body', 'excerpt']
// Matched against `extname(id)`, which is how a parser is chosen. Rows of a CSV
// file get a `#<row>` suffix
const RAW_DATA_EXTENSION = /^\.(?:ya?ml|json5?|csv(?:#\d+)?)$/i

const SOURCE_HASH_FIELD = '_i18nSourceHash'

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * An override array of plain values replaces the default wholesale, and an empty one
 * clears it, since filling a shorter translated list from the default tail is virtually
 * never intended.
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
      // `defuByIndex` cannot take arrays as top-level arguments
      result.push(mergeArraysByIndex(overrideItem, defaultItem))
    }
    else if (isPlainObject(overrideItem) && isPlainObject(defaultItem)) {
      result.push(defuByIndex(overrideItem, defaultItem))
    }
    else {
      result.push(overrideItem ?? defaultItem)
    }
  }
  return result
}

/**
 * `defu` that merges arrays by index instead of concatenating them, so translated arrays
 * of objects (such as nav items or cards) keep untranslated fields like routes and icons.
 *
 * In the `createDefu` merger, `obj[key]` holds the defaults (second argument) and `value`
 * the overrides (first argument).
 */
export const defuByIndex = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    ;(obj as Record<string, unknown>)[key as string] = mergeArraysByIndex(value as unknown[], obj[key] as unknown[])
    return true
  }
})

function pickSourceByOverride(source: unknown, override: unknown): unknown {
  // Arrays of objects merge by index, so their items are picked by index too
  if (Array.isArray(override) && Array.isArray(source) && override.some(item => typeof item === 'object' && item !== null)) {
    return override.map((item, index) => pickSourceByOverride(source[index], item))
  }
  if (isPlainObject(override) && isPlainObject(source)) {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(override)) {
      out[k] = pickSourceByOverride(source[k], override[k])
    }
    return out
  }
  return source
}

/**
 * Expand the inline `i18n` section of a parsed file into the source item followed by
 * one item per translated locale, each merging its overrides onto the source item.
 * Locale items store a hash of the source values they translate in
 * `meta._i18nSourceHash`, so tooling can spot outdated translations.
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
    // A block without translatable fields is a placeholder for a translation that does not exist yet
    if (block === null || block === undefined) {
      continue
    }
    if (!isPlainObject(block)) {
      logger.warn(`Inline i18n in "${parsedContent.id}" for locale ${JSON.stringify(locale)} is ignored, it must be an object.`)
      continue
    }
    if (locale === parsedContent.locale) {
      let matchesSource = false
      try {
        matchesSource = hash(pickSourceByOverride({ ...meta, ...parsedContent }, block)) === hash(block)
      }
      catch {
        // Too deep to compare
      }
      if (!matchesSource) {
        logger.warn(
          `Inline i18n in "${parsedContent.id}" has a block for its own locale ${JSON.stringify(locale)}, which is ignored. `
          + 'Top-level values apply to this locale.',
        )
      }
      continue
    }
    if (!i18nConfig.locales.includes(locale)) {
      logger.warn(
        `Inline i18n in "${parsedContent.id}" defines locale ${JSON.stringify(locale)} which is not in the collection's `
        + `locales [${i18nConfig.locales.map(l => `"${l}"`).join(', ')}]. This translation is ignored.`,
      )
      continue
    }

    try {
      const item = expandLocale(parsedContent, meta, locale, block, collectionType, schemaKeys)
      if (item) {
        items.push(item)
      }
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
): ParsedContentFile | undefined {
  const columns: Record<string, unknown> = {}
  const metaOverrides: Record<string, unknown> = {}
  for (const [field, value] of Object.entries(block)) {
    if (IGNORED_OVERRIDE_KEYS.includes(field)) {
      continue
    }
    // The id comes from the file name, so the content cannot change it
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
  if (!Object.keys(columns).length && !Object.keys(metaOverrides).length) {
    return undefined
  }

  // Hash only the source values this locale translates, so editing other fields does not mark the translation outdated
  const sourceValues: Record<string, unknown> = {}
  for (const [field, value] of Object.entries(columns)) {
    sourceValues[field] = pickSourceByOverride(source[field], value)
  }
  for (const [field, value] of Object.entries(metaOverrides)) {
    sourceValues[field] = pickSourceByOverride(meta[field], value)
  }

  const item = defuByIndex(columns, source) as ParsedContentFile
  // Merging two page ASTs by index would mix the nodes of both languages
  if (collectionType === 'page' && Object.hasOwn(columns, 'body')) {
    item.body = columns.body as ParsedContentFile['body']
  }
  translateDerivedSeo(item, source, columns)

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
 * Warn when two rows share a `(locale, stem)` pair, such as an inline translation and a
 * file in a locale directory, since fallback queries and `queryCollectionLocales` would
 * return both.
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
      `"${existing}" and "${item.id}" in collection "${collection}" are both the ${JSON.stringify(item.locale)} version of `
      + `"${item.stem}". Keep only one of them.`,
    )
  }
}

/** Directory names match locale codes case-insensitively, since generated paths are lowercased */
function findLocaleSegment(segments: string[], locales: string[], maxIndex: number): { index: number, locale: string } | undefined {
  for (let index = 0; index <= Math.min(maxIndex, segments.length - 1); index++) {
    const locale = findLocale(segments[index]!, locales)
    if (locale) {
      return { index, locale }
    }
  }
}

function findLocale(code: string, locales: string[]): string | undefined {
  return locales.find(locale => locale.toLowerCase() === code.toLowerCase())
}

export function resolveLocaleField(value: unknown, i18nConfig: CollectionI18nConfig, id: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  const locale = findLocale(String(value), i18nConfig.locales)
  if (!locale) {
    logger.warn(
      `"${id}" sets \`locale\` to ${JSON.stringify(value)}, which is not one of the collection locales `
      + `[${i18nConfig.locales.map(l => `"${l}"`).join(', ')}]. The field is ignored.`,
    )
  }
  return locale
}

/**
 * Detect the locale directory of a stem and remove it from `stem` and `path`. It can be
 * any segment of the source prefix or the first one after it. The stem is used because a
 * custom front-matter `path` never changes it.
 */
export function detectLocaleFromPath(
  path: string,
  stem: string,
  i18nConfig: CollectionI18nConfig,
  sourcePrefix: string = '',
): { locale: string, path: string, stem: string } {
  const stemParts = stem.split('/').filter(Boolean)
  // Only directories name a locale, the last segment is the file name
  const match = findLocaleSegment(stemParts.slice(0, -1), i18nConfig.locales, sourcePrefix.split('/').filter(Boolean).length)
  if (!match) {
    return { locale: i18nConfig.defaultLocale, path, stem }
  }

  const { index, locale } = match
  const pathParts = path.split('/').filter(Boolean)
  // A custom front-matter path without the locale directory is left untouched
  const strippedPath = pathParts[index]?.toLowerCase() === stemParts[index]!.toLowerCase()
    ? '/' + pathParts.filter((_, i) => i !== index).join('/')
    : path

  return {
    locale,
    path: strippedPath,
    stem: stemParts.filter((_, i) => i !== index).join('/'),
  }
}
