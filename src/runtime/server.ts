import type { CollectionQueryBuilder, Collections, ContentNavigationItem, PageCollections, QueryGroupFunction, SQLOperator, SurroundOptions } from '@nuxt/content'
import type { H3Event } from 'h3'
import { isEvent } from 'h3'
import { fetchQuery } from './internal/api'
import { generateNavigationTree } from './internal/navigation'
import { collectionQueryBuilder } from './internal/query'
import { generateSearchSections, type Section } from './internal/search'
import { generateItemSurround } from './internal/surround'

interface ChainablePromise<T extends keyof PageCollections, R> extends Promise<R> {
  where(field: keyof PageCollections[T] | string, operator: SQLOperator, value?: unknown): ChainablePromise<T, R>
  andWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): ChainablePromise<T, R>
  orWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): ChainablePromise<T, R>
  order(field: keyof PageCollections[T], direction: 'ASC' | 'DESC'): ChainablePromise<T, R>
}

export function queryCollection<T extends keyof Collections>(collection: T): CollectionQueryBuilder<Collections[T]>
export function queryCollection<T extends keyof Collections>(event: H3Event, collection: T): CollectionQueryBuilder<Collections[T]>
export function queryCollection<T extends keyof Collections>(...args: [H3Event, T] | [T]): CollectionQueryBuilder<Collections[T]> {
  if (!isEvent(args[0])) {
    throw new Error('Missing H3Event. Use \'queryCollection(event, collection)\' in server-side context.')
  }
  const [event, collection] = args as [H3Event, T]
  return collectionQueryBuilder<T>(collection, (collection, sql) => fetchQuery(event, collection, sql))
}

export function queryCollectionNavigation<T extends keyof PageCollections>(event: H3Event, collection: T, fields?: Array<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]>
export function queryCollectionNavigation<T extends keyof PageCollections>(collection: T, fields?: Array<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]>
export function queryCollectionNavigation<T extends keyof PageCollections>(...args: [H3Event, T, Array<keyof PageCollections[T]>?] | [T, Array<keyof PageCollections[T]>?]): ChainablePromise<T, ContentNavigationItem[]> {
  if (!isEvent(args[0])) {
    throw new Error('Missing H3Event. Use \'queryCollectionNavigation(event, collection, fields)\' in server-side context.')
  }
  const [event, collection, fields] = args as [H3Event, T, Array<keyof PageCollections[T]>?]
  return chainablePromise(event, collection, qb => generateNavigationTree(qb, fields))
}

export function queryCollectionItemSurroundings<T extends keyof PageCollections>(event: H3Event, collection: T, path: string, opts?: SurroundOptions<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]>
export function queryCollectionItemSurroundings<T extends keyof PageCollections>(collection: T, path: string, opts?: SurroundOptions<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]>
export function queryCollectionItemSurroundings<T extends keyof PageCollections>(...args: [H3Event, T, string, SurroundOptions<keyof PageCollections[T]>?] | [T, string, SurroundOptions<keyof PageCollections[T]>?]): ChainablePromise<T, ContentNavigationItem[]> {
  if (!isEvent(args[0])) {
    throw new Error('Missing H3Event. Use \'queryCollectionItemSurroundings(event, collection, path, opts)\' in server-side context.')
  }
  const [event, collection, path, opts] = args as [H3Event, T, string, SurroundOptions<keyof PageCollections[T]>?]
  return chainablePromise(event, collection, qb => generateItemSurround(qb, path, opts))
}

export function queryCollectionSearchSections<T extends keyof Collections>(event: H3Event, collection: T, opts?: { ignoredTags: string[] }): ChainablePromise<T, Section[]>
export function queryCollectionSearchSections<T extends keyof Collections>(collection: T, opts?: { ignoredTags: string[] }): ChainablePromise<T, Section[]>
export function queryCollectionSearchSections<T extends keyof Collections>(...args: [H3Event, T, { ignoredTags: string[] }?] | [T, { ignoredTags: string[] }?]): ChainablePromise<T, Section[]> {
  if (!isEvent(args[0])) {
    throw new Error('Missing H3Event. Use \'queryCollectionSearchSections(event, collection, opts)\' in server-side context.')
  }
  const [event, collection, opts] = args as [H3Event, T, { ignoredTags: string[] }?]
  return chainablePromise(event, collection, qb => generateSearchSections(qb, opts))
}

function chainablePromise<T extends keyof PageCollections, Result>(event: H3Event, collection: T, fn: (qb: CollectionQueryBuilder<PageCollections[T]>) => Promise<Result>) {
  const queryBuilder = queryCollection(event, collection)

  const chainable: ChainablePromise<T, Result> = {
    where(field, operator, value) {
      queryBuilder.where(String(field), operator, value)
      return chainable
    },
    andWhere(groupFactory) {
      queryBuilder.andWhere(groupFactory)
      return chainable
    },
    orWhere(groupFactory) {
      queryBuilder.orWhere(groupFactory)
      return chainable
    },
    order(field, direction) {
      queryBuilder.order(String(field), direction)
      return chainable
    },
    then(onfulfilled, onrejected) {
      return fn(queryBuilder).then(onfulfilled, onrejected)
    },
    catch(onrejected) {
      return this.then(undefined, onrejected)
    },
    finally(onfinally) {
      return this.then(undefined, undefined).finally(onfinally)
    },
    get [Symbol.toStringTag]() {
      return 'Promise'
    },
  }

  return chainable
}
