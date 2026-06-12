/**
 * Represents a single locale variant of a content item.
 * Returned by `queryCollectionLocales`, useful for language switchers and hreflang tags.
 */
export interface ContentLocaleEntry {
  locale: string
  stem: string
  /** Only present for `page` collections. */
  path?: string
  /** Only present for `page` collections. */
  title?: string
}

/**
 * The `meta` field name where non-default-locale items (produced by inline-i18n
 * expansion) store a hash of the default-locale source fields they translate.
 * Exposed as a constant so tooling — Studio, custom translator pipelines — can
 * detect outdated translations by comparing this hash across versions.
 *
 * @see `expandI18nData` in `src/utils/i18n.ts`
 */
export const I18N_SOURCE_HASH_FIELD = '_i18nSourceHash' as const

/**
 * Shape of `meta` on i18n-expanded items. The hash is per-locale and based only
 * on the default-locale values of fields THIS locale overrides — a change to a
 * field that this locale doesn't translate won't change its hash.
 */
export interface ContentI18nMeta {
  /** Hash of the default-locale source fields for the locale's translated fields. */
  [I18N_SOURCE_HASH_FIELD]?: string
}
