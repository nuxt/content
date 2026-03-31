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
  const items = await (queryBuilder as unknown as CollectionQueryBuilder<Record<string, unknown>>)
    .stem(stem)
    .all()

  return items.map((item) => {
    return {
      locale: item.locale as string,
      stem: item.stem as string,
      path: item.path as string | undefined,
      title: item.title as string | undefined,
    }
  })
}
