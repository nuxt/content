import type { CollectionQueryBuilder, ContentLocaleEntry } from '@nuxt/content'
import manifestMeta from '#content/manifest'

/** Columns of `ContentLocaleEntry` that only some collections have. */
const OPTIONAL_ENTRY_FIELDS = ['path', 'title']

/**
 * Query all locale variants of a content stem in an i18n collection, for language
 * switchers and hreflang tags. Reads only the columns of `ContentLocaleEntry` that
 * the collection has.
 */
export async function generateCollectionLocales<T = Record<string, unknown>>(
  queryBuilder: CollectionQueryBuilder<T>,
  collection: string,
  stem: string,
): Promise<ContentLocaleEntry[]> {
  const meta = manifestMeta[collection]
  if (!meta?.i18n) {
    if (import.meta.dev) {
      console.warn(
        `[@nuxt/content] queryCollectionLocales: collection "${collection}" has no i18n locales. `
        + 'Set `i18n: { locales, defaultLocale }` on the collection, or `i18n: true` with `@nuxtjs/i18n` configured.',
      )
    }
    return []
  }
  const selectFields = ['locale', 'stem', ...OPTIONAL_ENTRY_FIELDS.filter(field => field in meta.fields)] as Array<keyof T>

  // Filtering on both columns lets the database use the `(stem, locale)` index. The
  // filter on `locale` also turns off the active locale, so every variant is listed.
  const items = await queryBuilder
    .select(...selectFields)
    .where('locale', 'IN', meta.i18n.locales)
    .stem(stem)
    .all()

  return items.map(item => Object.fromEntries(
    selectFields.map(field => [field, (item as Record<string, unknown>)[field as string]]),
  ) as unknown as ContentLocaleEntry)
}
