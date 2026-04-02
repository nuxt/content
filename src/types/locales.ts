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
