export interface ContentLocaleEntry {
  locale: string
  stem: string
  /** Set in page collections, and in other collections whose schema has a `path` field */
  path?: string
  /** Set in page collections, and in other collections whose schema has a `title` field */
  title?: string
}
