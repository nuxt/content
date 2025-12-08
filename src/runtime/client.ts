import type { H3Event } from 'h3'
import { collectionQueryBuilder } from './internal/query'
import { generateNavigationTree } from './internal/navigation'
import { generateItemSurround } from './internal/surround'
import { generateSearchSections } from './internal/search'
import { fetchQuery } from './internal/api'
import type { Collections, PageCollections, CollectionQueryBuilder, SurroundOptions, SQLOperator, QueryGroupFunction, ContentNavigationItem } from '@nuxt/content'
import { tryUseNuxtApp } from '#imports'

interface ChainablePromise<T extends keyof PageCollections, R> extends Promise<R> {
  where(field: keyof PageCollections[T] | string, operator: SQLOperator, value?: unknown): ChainablePromise<T, R>
  andWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): ChainablePromise<T, R>
  orWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): ChainablePromise<T, R>
  order(field: keyof PageCollections[T], direction: 'ASC' | 'DESC'): ChainablePromise<T, R>
}

export const queryCollection = <T extends keyof Collections>(collection: T): CollectionQueryBuilder<Collections[T]> => {
  const event = tryUseNuxtApp()?.ssrContext?.event
  return collectionQueryBuilder<T>(collection, (collection, sql, opts) => executeContentQuery(event, collection, sql, { signal: opts?.signal }))
}

export interface QueryCollectionNavigationOptions {
  signal?: AbortSignal
}

export function queryCollectionNavigation<T extends keyof PageCollections>(collection: T, fields?: Array<keyof PageCollections[T]>, { signal }: QueryCollectionNavigationOptions = {}): ChainablePromise<T, ContentNavigationItem[]> {
  return chainablePromise(collection, qb => generateNavigationTree(qb, fields, { signal }))
}

export interface QueryCollectionItemSurroundingsOptions<F> extends SurroundOptions<F> {
  signal?: AbortSignal
}

export function queryCollectionItemSurroundings<T extends keyof PageCollections>(collection: T, path: string, opts?: QueryCollectionItemSurroundingsOptions<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]> {
  return chainablePromise(collection, qb => generateItemSurround(qb, path, opts))
}

export interface QueryCollectionSearchSectionsOptions {
  ignoredTags?: string[]
  signal?: AbortSignal
}

export function queryCollectionSearchSections(collection: keyof Collections, opts?: QueryCollectionSearchSectionsOptions) {
  return chainablePromise(collection, qb => generateSearchSections(qb, opts))
}

async function executeContentQuery<T extends keyof Collections, Result = Collections[T]>(event: H3Event | undefined, collection: T, sql: string, { signal }: { signal?: AbortSignal } = {}): Promise<Result[]> {
  if (import.meta.client && window.WebAssembly) {
    return queryContentSqlClientWasm<T, Result>(collection, sql, { signal }) as Promise<Result[]>
  }
  else {
    return fetchQuery(event, String(collection), sql, { signal })
  }
}

async function queryContentSqlClientWasm<T extends keyof Collections, Result = Collections[T]>(collection: T, sql: string, { signal }: { signal?: AbortSignal } = {}): Promise<Result[]> {
  return new Promise<Result[]>((resolve, reject) => {
    // todo: explore aborting wasm queries with signal
    signal?.addEventListener('abort', () => {
      reject(new DOMException('Aborted', 'AbortError'))
    })
    import('./internal/database.client')
      .then(m => m.loadDatabaseAdapter(collection))
      .then(db => db.all<Result>(sql))
      .then(resolve)
      .catch(reject)
  })
}

function chainablePromise<T extends keyof PageCollections, Result>(collection: T, fn: (qb: CollectionQueryBuilder<PageCollections[T]>) => Promise<Result>) {
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
