import { createDefu } from 'defu'
import { hash } from 'ohash'
import type { CollectionI18nConfig } from '../types/collection'
import type { ParsedContentFile } from '../types'

/**
 * Custom defu that merges arrays by index (item-by-item) instead of concatenating.
 * Applied recursively to all nested arrays within merged objects.
 * Used for inline i18n expansion: locale overrides merge with default locale items
 * so untranslated fields (routes, IDs, icons, URLs) are preserved from the default.
 *
 * In createDefu's merger: obj[key] = accumulated result (has defaults), value = override.
 * Override items take priority; default items fill gaps for missing fields.
 */
export const defuByIndex = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    const defaultArr = obj[key]
    const overrideArr = value
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
 * The default locale keeps the original content; non-default locales get a deep-merged
 * copy where only overridden fields differ. Non-default items include `_i18nSourceHash`
 * for tracking whether the source content has changed since translation.
 *
 * For page collections (`collectionType: 'page'`), the body AST is replaced wholesale
 * rather than deep-merged, since body is a parsed markdown tree that cannot be meaningfully merged.
 *
 * Note: this function mutates `parsedContent.meta` (removes the `i18n` key) and
 * sets `parsedContent.locale` if not already set. This is acceptable because the
 * source content is always consumed (inserted into DB) immediately after expansion.
 */
export function expandI18nData(
  parsedContent: ParsedContentFile,
  i18nConfig: CollectionI18nConfig,
  collectionType?: 'page' | 'data',
): ParsedContentFile[] {
  const i18nData = parsedContent.meta?.i18n as Record<string, Record<string, unknown>> | undefined
  if (!i18nData) {
    if (!parsedContent.locale) {
      parsedContent.locale = i18nConfig.defaultLocale
    }
    return [parsedContent]
  }

  const { i18n: _removed, ...cleanMeta } = parsedContent.meta
  parsedContent.meta = cleanMeta

  if (!parsedContent.locale) {
    parsedContent.locale = i18nConfig.defaultLocale
  }

  // Compute source hash from default locale's translatable fields
  const translatedFields = new Set(Object.values(i18nData).flatMap(Object.keys))
  const sourceFields: Record<string, unknown> = {}
  for (const field of translatedFields) {
    sourceFields[field] = parsedContent[field]
  }
  const i18nSourceHash = hash(sourceFields)

  const items: ParsedContentFile[] = [parsedContent]

  for (const [locale, overrides] of Object.entries(i18nData)) {
    if (locale === parsedContent.locale) continue

    // Deep merge preserves untranslated fields (routes, IDs, icons).
    // For page collections, body AST must not be deep-merged — replace it wholesale.
    const merged = defuByIndex(overrides, parsedContent) as ParsedContentFile
    if (collectionType === 'page' && overrides.body) {
      merged.body = overrides.body
    }

    const localeItem: ParsedContentFile = {
      ...merged,
      id: `${parsedContent.id}#${locale}`,
      locale,
      meta: { ...cleanMeta, _i18nSourceHash: i18nSourceHash },
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
