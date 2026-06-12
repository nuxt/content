import { createDefu } from 'defu'
import { hash } from 'ohash'
import type { CollectionI18nConfig } from '../types/collection'
import { I18N_SOURCE_HASH_FIELD } from '../types/locales'
import { logger } from './dev'
import type { ParsedContentFile } from '../types'

/**
 * Identity fields that describe a row rather than its translatable content.
 * They are stripped from inline locale overrides so a translation cannot change
 * a row's identity, which would break the `(locale, stem)` pairing used by the
 * fallback merge and by `queryCollectionLocales`.
 */
const IDENTITY_OVERRIDE_KEYS = ['id', 'stem', 'path', 'locale', 'extension']

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
      result.push(overrideItem !== undefined ? overrideItem : defaultItem)
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
 * Expand inline i18n data from a parsed content file into per-locale items.
 * The default locale keeps the original content, while non-default locales get
 * a deep-merged copy in which only overridden fields differ. Non-default items
 * include `_i18nSourceHash` for tracking whether the source content has changed
 * since translation.
 *
 * For page collections (`collectionType: 'page'`), the body AST is replaced
 * wholesale rather than deep-merged, since `body` is a parsed markdown tree
 * that cannot be meaningfully merged.
 *
 * Override handling rules:
 * - Identity fields (id, stem, path, locale, extension) are stripped from
 *   overrides so a translation cannot change a row's identity.
 * - A locale key not listed in the collection's `i18n.locales` is skipped, since
 *   it would never be queryable and dev HMR cleanup could never remove it.
 * - Translations of fields not declared in the collection schema are dropped by
 *   the insert step (non-schema fields live on `meta`), so a dev warning surfaces
 *   the lost translation when `schemaKeys` is provided.
 *
 * `meta` semantics: the default locale keeps its full `meta` (minus the `i18n`
 * key). Non-default locale items receive a fresh `meta` of the form
 * `{ ...cleanMeta, _i18nSourceHash }`. Any `meta` provided inside a locale
 * override is intentionally dropped, because locale-specific tracking state
 * (`_i18nSourceHash`) lives on `meta` and must not be overridden by user content.
 *
 * This function mutates `parsedContent.meta` (removing the `i18n` key) and sets
 * `parsedContent.locale` if not already set. This is acceptable because the
 * source content is always consumed (inserted into the database) immediately
 * after expansion.
 */
export function expandI18nData(
  parsedContent: ParsedContentFile,
  i18nConfig: CollectionI18nConfig,
  collectionType?: 'page' | 'data',
  schemaKeys?: string[],
): ParsedContentFile[] {
  const meta = parsedContent.meta as Record<string, unknown> | undefined
  const i18nData = meta?.i18n as Record<string, Record<string, unknown>> | undefined
  if (!i18nData) {
    if (!parsedContent.locale) {
      parsedContent.locale = i18nConfig.defaultLocale
    }
    return [parsedContent]
  }

  const { i18n: _removed, ...cleanMeta } = meta!
  parsedContent.meta = cleanMeta

  if (!parsedContent.locale) {
    parsedContent.locale = i18nConfig.defaultLocale
  }

  const items: ParsedContentFile[] = [parsedContent]

  for (const [locale, rawOverrides] of Object.entries(i18nData)) {
    if (locale === parsedContent.locale) continue

    if (!i18nConfig.locales.includes(locale)) {
      logger.warn(
        `Inline i18n in "${parsedContent.id}" defines locale "${locale}" which is not in the collection's `
        + `locales [${i18nConfig.locales.map(l => `"${l}"`).join(', ')}]. This translation is ignored.`,
      )
      continue
    }

    // Strip identity fields so a translation cannot change the row's identity.
    const overrides: Record<string, unknown> = {}
    for (const [field, value] of Object.entries(rawOverrides)) {
      if (!IDENTITY_OVERRIDE_KEYS.includes(field)) {
        overrides[field] = value
      }
    }

    // Warn when a translated field is not a schema column. Such fields are routed
    // to `meta` by the parser and dropped by the insert step, so the translation
    // would be silently lost.
    if (schemaKeys) {
      for (const field of Object.keys(overrides)) {
        if (field !== 'body' && !schemaKeys.includes(field)) {
          logger.warn(
            `Inline i18n in "${parsedContent.id}" translates "${field}" for locale "${locale}", but "${field}" `
            + 'is not declared in the collection schema. Non-schema fields are not persisted per locale. '
            + 'Declare the field in the collection schema to translate it.',
          )
        }
      }
    }

    // The source hash is per-locale. It is computed only from the default values
    // of the leaf fields that *this* locale actually translates, so a default
    // change to an untranslated sibling does not flip the hash.
    const sourceFields: Record<string, unknown> = {}
    for (const field of Object.keys(overrides)) {
      sourceFields[field] = pickSourceByOverride(parsedContent[field], overrides[field])
    }
    const i18nSourceHash = hash(sourceFields)

    // Deep merge preserves untranslated fields (routes, IDs, icons). For page
    // collections, the body AST must not be deep-merged and is instead replaced
    // wholesale. The `'body' in overrides` check ensures explicit null or empty
    // bodies still replace, rather than falling back to deep-merging the default
    // AST.
    const merged = defuByIndex(overrides, parsedContent) as ParsedContentFile
    if (collectionType === 'page' && 'body' in overrides) {
      merged.body = overrides.body as ParsedContentFile['body']
    }

    const localeItem: ParsedContentFile = {
      ...merged,
      id: `${parsedContent.id}#${locale}`,
      locale,
      meta: { ...cleanMeta, [I18N_SOURCE_HASH_FIELD]: i18nSourceHash },
    }

    items.push(localeItem)
  }

  return items
}

/**
 * Detect the locale from the content stem and strip the locale prefix from both
 * path and stem. The locale is read from the stem's first segment rather than the
 * path's, because the stem is derived from the file id and is never influenced by
 * a custom `path` front-matter value. Returns the default locale when no prefix
 * matches.
 */
export function detectLocaleFromPath(
  path: string,
  stem: string,
  i18nConfig: CollectionI18nConfig,
): { locale: string, path: string, stem: string } {
  const stemParts = stem.split('/').filter(Boolean)
  const firstPart = stemParts[0]

  if (firstPart && i18nConfig.locales.includes(firstPart)) {
    const newStem = stemParts.slice(1).join('/')

    // Strip the locale segment from `path` only when it is actually present. A
    // custom front-matter `path` that does not start with the locale segment is
    // left untouched.
    const pathParts = path.split('/').filter(Boolean)
    const strippedPath = pathParts[0] === firstPart
      ? '/' + pathParts.slice(1).join('/')
      : path

    return {
      locale: firstPart,
      path: strippedPath === '/' || strippedPath === '' ? '/' : strippedPath,
      stem: newStem,
    }
  }

  return {
    locale: i18nConfig.defaultLocale,
    path,
    stem,
  }
}
