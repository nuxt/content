import { tryUseNuxtApp } from '#imports'
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
  if (isEvent(args[0])) {
    throw new Error('Unexpected H3Event. Use \'queryCollection(event, collection)\' only in server-side context.')
  }
  const collection = args[0] as T
  const event = tryUseNuxtApp()?.ssrContext?.event
  return collectionQueryBuilder<T>(collection, (collection, sql) => executeContentQuery(event, collection, sql))
}

export function queryCollectionNavigation<T extends keyof PageCollections>(event: H3Event, collection: T, fields?: Array<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]>
export function queryCollectionNavigation<T extends keyof PageCollections>(collection: T, fields?: Array<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]>
export function queryCollectionNavigation<T extends keyof PageCollections>(...args: [H3Event, T, Array<keyof PageCollections[T]>?] | [T, Array<keyof PageCollections[T]>?]): ChainablePromise<T, ContentNavigationItem[]> {
  if (isEvent(args[0])) {
    throw new Error('Unexpected H3Event. Use \'queryCollectionNavigation(event, collection, fields)\' only in server-side context.')
  }
  const [collection, fields] = args as [T, Array<keyof PageCollections[T]>?]
  return chainablePromise(collection, qb => generateNavigationTree(qb, fields))
}

export function queryCollectionItemSurroundings<T extends keyof PageCollections>(event: H3Event, collection: T, path: string, opts?: SurroundOptions<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]>
export function queryCollectionItemSurroundings<T extends keyof PageCollections>(collection: T, path: string, opts?: SurroundOptions<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]>
export function queryCollectionItemSurroundings<T extends keyof PageCollections>(...args: [H3Event, T, string, SurroundOptions<keyof PageCollections[T]>?] | [T, string, SurroundOptions<keyof PageCollections[T]>?]): ChainablePromise<T, ContentNavigationItem[]> {
  if (isEvent(args[0])) {
    throw new Error('Unexpected H3Event. Use \'queryCollectionItemSurroundings(event, collection, path, opts)\' only in server-side context.')
  }
  const [collection, path, opts] = args as [T, string, SurroundOptions<keyof PageCollections[T]>?]
  return chainablePromise(collection, qb => generateItemSurround(qb, path, opts))
}

export function queryCollectionSearchSections<T extends keyof Collections>(event: H3Event, collection: T, opts?: { ignoredTags: string[] }): ChainablePromise<T, Section[]>
export function queryCollectionSearchSections<T extends keyof Collections>(collection: T, opts?: { ignoredTags: string[] }): ChainablePromise<T, Section[]>
export function queryCollectionSearchSections<T extends keyof Collections>(...args: [H3Event, T, { ignoredTags: string[] }?] | [T, { ignoredTags: string[] }?]): ChainablePromise<T, Section[]> {
  if (isEvent(args[0])) {
    throw new Error('Unexpected H3Event. Use \'queryCollectionSearchSections(event, collection, opts)\' only in server-side context.')
  }
  const [collection, opts] = args as [T, { ignoredTags: string[] }?]
  return chainablePromise(collection, qb => generateSearchSections(qb, opts))
}

async function executeContentQuery<T extends keyof Collections, Result = Collections[T]>(event: H3Event | undefined, collection: T, sql: string) {
  if (import.meta.client && window.WebAssembly) {
    return queryContentSqlClientWasm<T, Result>(collection, sql) as Promise<Result[]>
  }
  else {
    return fetchQuery(event, String(collection), sql) as Promise<Result[]>
  }
}

async function queryContentSqlClientWasm<T extends keyof Collections, Result = Collections[T]>(collection: T, sql: string) {
  const rows = await import('./internal/database.client')
    .then(m => m.loadDatabaseAdapter(collection))
    .then(db => db.all<Result>(sql))

  return rows as Result[]
}

function chainablePromise<T extends keyof PageCollections, Result>(collection: T, fn: (qb: CollectionQueryBuilder<PageCollections[T]>) => Promise<Result>): ChainablePromise<T, Result> {
  const queryBuilder = queryCollection(collection)

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
