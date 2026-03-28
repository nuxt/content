import type { CollectionQueryBuilder } from '@nuxt/content'

export interface ContentLocaleEntry {
  locale: string
  path: string
  stem: string
  title?: string
}

/**
 * Query all locale variants for a given content stem within an i18n-enabled collection.
 * Returns one entry per locale, useful for building language switchers and hreflang tags.
 */
export async function generateCollectionLocales<T extends Record<string, unknown>>(
  queryBuilder: CollectionQueryBuilder<T>,
  stem: string,
): Promise<ContentLocaleEntry[]> {
  const items = await queryBuilder
    .where('stem', '=', stem)
    .all()

  return items.map((item) => {
    const record = item as unknown as Record<string, unknown>
    return {
      locale: record.locale as string,
      path: record.path as string,
      stem: record.stem as string,
      title: record.title as string | undefined,
    }
  })
}
