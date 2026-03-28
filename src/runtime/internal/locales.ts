import type { CollectionQueryBuilder, ContentLocaleEntry } from '@nuxt/content'

/**
 * Query all locale variants for a given content stem within an i18n-enabled collection.
 * Returns one entry per locale, useful for building language switchers and hreflang tags.
 * Only fetches the fields needed (locale, stem, path, title) — not full body ASTs.
 */
export async function generateCollectionLocales<T extends Record<string, unknown>>(
  queryBuilder: CollectionQueryBuilder<T>,
  stem: string,
): Promise<ContentLocaleEntry[]> {
  // Select only the lightweight fields we need — avoids fetching large body ASTs
  const items = await (queryBuilder as unknown as CollectionQueryBuilder<Record<string, unknown>>)
    .select('locale' as never, 'stem' as never, 'path' as never, 'title' as never)
    .where('stem', '=', stem)
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
