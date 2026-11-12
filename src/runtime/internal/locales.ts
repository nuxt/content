import type { CollectionQueryBuilder, ContentLocaleEntry, ManifestCollectionsMeta } from '@nuxt/content'
import manifestMeta from '#content/manifest'

const LOCALE_ENTRY_FIELDS = ['locale', 'stem', 'path', 'title'] as const

/**
 * Query all locale variants of a content stem in an i18n collection, for language
 * switchers and hreflang tags. Reads only the columns of `ContentLocaleEntry` that
 * the collection has (`path` and `title` exist on page collections only).
 */
export async function generateCollectionLocales<T = Record<string, unknown>>(
  queryBuilder: CollectionQueryBuilder<T>,
  collection: string,
  stem: string,
): Promise<ContentLocaleEntry[]> {
  const meta = (manifestMeta as ManifestCollectionsMeta)[collection]
  if (!meta?.i18n) {
    if (import.meta.dev) {
      console.warn(
        `[@nuxt/content] queryCollectionLocales: collection "${collection}" has no \`i18n\` configured. `
        + 'Add `i18n: true` (or an explicit `i18n: { locales, defaultLocale }`) to the collection definition.',
      )
    }
    return []
  }
  const selectFields = LOCALE_ENTRY_FIELDS.filter(f => f in meta.fields) as Array<keyof T>

  // Filtering on both columns lets the database use the `(locale, stem)` index.
  const items = await queryBuilder
    .select(...selectFields)
    .where('locale', 'IN', meta.i18n.locales)
    .stem(stem)
    .all()

  return items.map((item) => {
    const row = item as Record<string, unknown>
    return {
      locale: row.locale as string,
      stem: row.stem as string,
      path: row.path as string | undefined,
      title: row.title as string | undefined,
    }
  })
}
