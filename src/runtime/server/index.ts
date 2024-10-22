import type { Collections, CollectionQueryBuilder, PageCollections, SurroundOptions } from '@nuxt/content'
import type { H3Event } from 'h3'
import { collectionQureyBuilder, executeContentQueryWithEvent } from '../internal/query'
import { generateNavigationTree } from '../internal/navigation'
import { generateItemSurround } from '../internal/surround'
import { generateSearchSections } from '../internal/search'

export const queryCollectionWithEvent = <T extends keyof Collections>(event: H3Event, collection: T): CollectionQueryBuilder<Collections[T]> => {
  return collectionQureyBuilder<T>(collection, sql => executeContentQueryWithEvent(event, sql))
}

export async function queryCollectionNavigationWithEvent<T extends keyof PageCollections>(event: H3Event, collection: T, fields?: Array<keyof PageCollections[T]>) {
  return generateNavigationTree(queryCollectionWithEvent(event, collection), fields)
}

export async function queryCollectionItemSurroundingsWithEvent<T extends keyof PageCollections>(event: H3Event, collection: T, path: string, opts?: SurroundOptions<keyof PageCollections[T]>) {
  return generateItemSurround(queryCollectionWithEvent(event, collection), path, opts)
}

export async function queryCollectionSearchSections(event: H3Event, collection: keyof Collections, opts?: { ignoredTags: string[] }) {
  return generateSearchSections(queryCollectionWithEvent(event, collection), opts)
}
