import type { CollectionQueryBuilder, ContentLocaleEntry, ManifestCollectionsMeta } from '@nuxt/content'
import manifestMeta from '#content/manifest'

const LOCALE_ENTRY_FIELDS = ['locale', 'stem', 'path', 'title'] as const

/**
 * Query all locale variants for a given content stem within an i18n-enabled collection.
 * Returns one entry per locale, useful for building language switchers and hreflang tags.
 *
 * Selects only the columns that map to `ContentLocaleEntry` (and that the collection
 * actually has — `path`/`title` only exist on `page` collections). This keeps the
 * payload small for data collections with large fields.
 */
export async function generateCollectionLocales<T = Record<string, unknown>>(
  queryBuilder: CollectionQueryBuilder<T>,
  collection: string,
  stem: string,
): Promise<ContentLocaleEntry[]> {
  const collectionFields = (manifestMeta as ManifestCollectionsMeta)[collection]?.fields ?? {}
  const selectFields = LOCALE_ENTRY_FIELDS.filter(f => f in collectionFields) as Array<keyof T>

  const items = await queryBuilder
    .select(...selectFields)
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
