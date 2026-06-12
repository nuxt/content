import { createDefu } from 'defu'
import { hash } from 'ohash'
import type { CollectionI18nConfig } from '../types/collection'
import { I18N_SOURCE_HASH_FIELD } from '../types/locales'
import type { ParsedContentFile } from '../types'

/**
 * Custom `defu` merger that combines arrays by index (item-by-item) instead of
 * concatenating. Applied recursively to all nested arrays within merged objects.
 *
 * Used for inline i18n expansion. Arrays of objects (such as nav items or cards)
 * deep-merge so untranslated fields (routes, IDs, icons, URLs) are preserved from
 * the default. Scalar arrays (for example `tags: ['a', 'b', 'c']`) are replaced
 * wholesale, since pad-filling them with the default's tail is virtually never
 * what authors want when they intentionally provide a shorter locale-specific
 * list.
 *
 * Heuristic, if every element of the override array is a non-object, the array
 * is treated as scalar and replaced. Otherwise it deep-merges by index, with
 * the default's trailing items preserved for missing override slots.
 *
 * Inside `createDefu`'s merger, `obj[key]` is the defaults (second arg) and
 * `value` is the overrides (first arg). Override items take priority and
 * default items fill any gaps.
 */
export const defuByIndex = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    const defaultArr = obj[key]
    const overrideArr = value

    // Scalar override arrays replace wholesale (no pad-fill from the default).
    // An empty override array also short-circuits here, since the author has
    // explicitly cleared it.
    const isScalarOverride = (overrideArr as unknown[]).every(
      (item: unknown) => typeof item !== 'object' || item === null,
    )
    if (isScalarOverride) {
      ;(obj as Record<string, unknown>)[key as string] = [...overrideArr]
      return true
    }

    const maxLen = Math.max(overrideArr.length, defaultArr.length)
    const result = []
    for (let i = 0; i < maxLen; i++) {
      const overrideItem = overrideArr[i]
      const defaultItem = defaultArr[i]
      if (overrideItem !== undefined && defaultItem !== undefined
        && typeof overrideItem === 'object' && overrideItem !== null
        && typeof defaultItem === 'object' && defaultItem !== null) {
        // Recursively merge with defuByIndex so nested arrays also merge by index
        result.push(defuByIndex(overrideItem, defaultItem))
      }
      else {
        result.push(overrideItem !== undefined ? overrideItem : defaultItem)
      }
    }
    ;(obj as Record<string, unknown>)[key as string] = result
    return true
  }
})

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
 * `meta` semantics, the default locale keeps its full `meta` (minus the `i18n`
 * key). Non-default locale items receive a fresh `meta` of the form
 * `{ ...cleanMeta, _i18nSourceHash }`. Any `meta` provided inside a locale
 * override is intentionally dropped, because locale-specific tracking state
 * (`_i18nSourceHash`) lives on `meta` and must not be overridden by user
 * content. Use a top-level field when a locale-varying value is needed.
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

  for (const [locale, overrides] of Object.entries(i18nData)) {
    if (locale === parsedContent.locale) continue

    // The source hash is per-locale. It is computed only from the default values
    // of fields that *this* locale actually translates. A field translated only
    // in `de` must not enter the `fr` hash. Otherwise a default change to that
    // field would flip `fr`'s hash and signal a false "stale translation".
    const sourceFields: Record<string, unknown> = {}
    for (const field of Object.keys(overrides)) {
      sourceFields[field] = parsedContent[field]
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
 * Detect locale from the first path segment and strip the locale prefix
 * from both path and stem. Returns default locale when no prefix matches.
 */
export function detectLocaleFromPath(
  path: string,
  stem: string,
  i18nConfig: CollectionI18nConfig,
): { locale: string, path: string, stem: string } {
  const pathParts = path.split('/').filter(Boolean)
  const firstPart = pathParts[0]

  if (firstPart && i18nConfig.locales.includes(firstPart)) {
    const pathWithoutLocale = '/' + pathParts.slice(1).join('/')

    let newStem = stem
    if (stem === firstPart) {
      newStem = ''
    }
    else if (stem.startsWith(firstPart + '/')) {
      newStem = stem.slice(firstPart.length + 1)
    }

    return {
      locale: firstPart,
      path: pathWithoutLocale === '/' ? '/' : pathWithoutLocale,
      stem: newStem,
    }
  }

  return {
    locale: i18nConfig.defaultLocale,
    path,
    stem,
  }
}
