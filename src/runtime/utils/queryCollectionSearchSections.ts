import type { Collections } from '@nuxt/content'
import { queryCollection } from './queryCollection'
import { splitPageIntoSections } from './internal/search'

export async function queryCollectionSearchSections(collection: keyof Collections, opts?: { ignoredTags: string[] }) {
  const { ignoredTags = [] } = opts || {}

  const documents = await queryCollection(collection)
    .select('path', 'body', 'description', 'title')
    .all()

  return documents.flatMap(doc => splitPageIntoSections(doc, { ignoredTags }))
}
