import * as server from './server'
import type { Collections, CollectionQueryBuilder } from '@nuxt/content'
import type { H3Event } from 'h3'

/**
 * `@nuxt/content/nitro` import is deprecated and will be removed in the next major version.
 * Use `@nuxt/content/server` instead.
 */

/**
 * @deprecated Import from `@nuxt/content/server` instead
 */
export const queryCollection = <T extends keyof Collections>(event: H3Event, collection: T): CollectionQueryBuilder<Collections[T]> => {
  return server.queryCollection(event, collection)
}

/**
 * @deprecated Import from `@nuxt/content/server` instead
 */
export const queryCollectionNavigation = server.queryCollectionNavigation

/**
 * @deprecated Import from `@nuxt/content/server` instead
 */
export const queryCollectionItemSurroundings = server.queryCollectionItemSurroundings

/**
 * @deprecated Import from `@nuxt/content/server` instead
 */
export const queryCollectionSearchSections = server.queryCollectionSearchSections
