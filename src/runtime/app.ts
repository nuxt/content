import type { Collections, PageCollections, CollectionQueryBuilder, SurroundOptions, SQLOperator, QueryGroupFunction } from '@nuxt/content'
import { collectionQueryBuilder } from './internal/query'
import { measurePerformance } from './internal/performance'
import { generateNavigationTree } from './internal/navigation'
import { generateItemSurround } from './internal/surround'
import { generateSearchSections } from './internal/search'
import { fetchQuery } from './internal/api'
import { tryUseNuxtApp } from '#imports'

interface ChainablePromise<T extends keyof PageCollections, R> extends Promise<R> {
  where(field: keyof PageCollections[T] | string, operator: SQLOperator, value?: unknown): ChainablePromise<T, R>
  andWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): ChainablePromise<T, R>
  orWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): ChainablePromise<T, R>
  order(field: keyof PageCollections[T], direction: 'ASC' | 'DESC'): ChainablePromise<T, R>
}

export const queryCollection = <T extends keyof Collections>(collection: T): CollectionQueryBuilder<Collections[T]> => {
  return collectionQueryBuilder<T>(collection, (collection, sql) => executeContentQuery(collection, sql))
}

export function queryCollectionNavigation<T extends keyof PageCollections>(collection: T, fields?: Array<keyof PageCollections[T]>) {
  return chainablePromise(collection, qb => generateNavigationTree(qb, fields))
}

export function queryCollectionItemSurroundings<T extends keyof PageCollections>(collection: T, path: string, opts?: SurroundOptions<keyof PageCollections[T]>) {
  return chainablePromise(collection, qb => generateItemSurround(qb, path, opts))
}

export async function queryCollectionSearchSections(collection: keyof Collections, opts?: { ignoredTags: string[] }) {
  return generateSearchSections(queryCollection(collection), opts)
}

async function executeContentQuery<T extends keyof Collections, Result = Collections[T]>(collection: T, sql: string) {
  if (import.meta.client) {
    return queryContentSqlClientWasm<T, Result>(collection, sql) as Promise<Result[]>
  }
  else {
    return fetchQuery(tryUseNuxtApp()?.ssrContext?.event, String(collection), sql) as Promise<Result[]>
  }
}

async function queryContentSqlClientWasm<T extends keyof Collections, Result = Collections[T]>(collection: T, sql: string) {
  const perf = measurePerformance()

  const rows = await import('./internal/database.client')
    .then(m => m.loadDatabaseAdapter(collection))
    .then(db => db.all<Result>(sql))

  perf.tick('Execute Query')

  console.log(perf.end('Run with Compressed Dump'))

  return rows as Result[]
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
