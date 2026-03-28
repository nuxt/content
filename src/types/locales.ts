/**
 * Represents a single locale variant of a content item.
 * Returned by `queryCollectionLocales`, useful for language switchers and hreflang tags.
 */
export interface ContentLocaleEntry {
  locale: string
  path: string
  stem: string
  title?: string
}
