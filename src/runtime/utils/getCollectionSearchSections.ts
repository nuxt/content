import type { Collections } from '@farnabaz/content-next'
import { queryCollection } from './queryCollection'
import { splitPageIntoSections } from './internal/search'

export async function getCollectionSearchSections(collection: keyof Collections, opts: { ignoredTags: string[] }) {
  const { ignoredTags = [] } = opts

  const documents = await queryCollection(collection).all()

  return documents.flatMap(doc => splitPageIntoSections(collection, doc, { ignoredTags }))
}
