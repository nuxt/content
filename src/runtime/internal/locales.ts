import type { CollectionQueryBuilder, ContentLocaleEntry } from '@nuxt/content'

/**
 * Query all locale variants for a given content stem within an i18n-enabled collection.
 * Returns one entry per locale, useful for building language switchers and hreflang tags.
 */
export async function generateCollectionLocales<T = Record<string, unknown>>(
  queryBuilder: CollectionQueryBuilder<T>,
  stem: string,
): Promise<ContentLocaleEntry[]> {
  // No .select() — data collections lack path/title columns; SELECT * is safe here
  // because ContentLocaleEntry marks path? and title? as optional.
  const items = await queryBuilder
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
