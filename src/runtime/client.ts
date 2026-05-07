import type { H3Event } from 'h3'
import { collectionQueryBuilder } from './internal/query'
import { generateNavigationTree } from './internal/navigation'
import { generateItemSurround } from './internal/surround'
import type { GenerateSearchSectionsOptions, SearchCollectionOptions, SearchResult } from './internal/search'
import { generateSearchSections, buildFTSIndex, queryFTS, resetFTSIndex } from './internal/search'
import { fetchQuery } from './internal/api'
import type { Collections, PageCollections, CollectionQueryBuilder, SurroundOptions, SQLOperator, QueryGroupFunction, ContentNavigationItem, DatabaseAdapter } from '@nuxt/content'
import { ref, toValue, watch, tryUseNuxtApp } from '#imports'
import type { MaybeRefOrGetter } from 'vue'

export type { SearchCollectionOptions, SearchResult, GenerateSearchSectionsOptions } from './internal/search'

interface ChainablePromise<T extends keyof PageCollections, R> extends Promise<R> {
  where(field: keyof PageCollections[T] | string, operator: SQLOperator, value?: unknown): ChainablePromise<T, R>
  andWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): ChainablePromise<T, R>
  orWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): ChainablePromise<T, R>
  order(field: keyof PageCollections[T], direction: 'ASC' | 'DESC'): ChainablePromise<T, R>
}

export const queryCollection = <T extends keyof Collections>(collection: T): CollectionQueryBuilder<Collections[T]> => {
  const event = tryUseNuxtApp()?.ssrContext?.event
  return collectionQueryBuilder<T>(collection, (collection, sql) => executeContentQuery(event, collection, sql))
}

export function queryCollectionNavigation<T extends keyof PageCollections>(collection: T, fields?: Array<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]> {
  return chainablePromise(collection, qb => generateNavigationTree(qb, fields))
}

export function queryCollectionItemSurroundings<T extends keyof PageCollections>(collection: T, path: string, opts?: SurroundOptions<keyof PageCollections[T]>): ChainablePromise<T, ContentNavigationItem[]> {
  return chainablePromise(collection, qb => generateItemSurround(qb, path, opts))
}

export function queryCollectionSearchSections<T extends keyof PageCollections>(collection: T, opts?: GenerateSearchSectionsOptions) {
  return chainablePromise(collection, qb => generateSearchSections(qb, opts))
}

export function useSearchCollection<T extends keyof PageCollections>(
  collection: MaybeRefOrGetter<T | T[]>,
  opts?: GenerateSearchSectionsOptions & { immediate?: boolean },
) {
  const { immediate = true, ...indexOpts } = opts || {}
  const status = ref<'idle' | 'loading' | 'ready' | 'error'>(immediate ? 'loading' : 'idle')
  let db: DatabaseAdapter | undefined
  let initPromise: Promise<DatabaseAdapter> | undefined
  let indexedFor: string[] = []

  function resolveCollections() {
    const val = toValue(collection)
    return (Array.isArray(val) ? val : [val]).map(String)
  }

  async function init() {
    const collections = resolveCollections()
    const hasRemovedCollections = indexedFor.some(c => !collections.includes(c))
    const newCollections = collections.filter(c => !indexedFor.includes(c))

    if (!newCollections.length && !hasRemovedCollections && initPromise) return initPromise

    status.value = 'loading'
    initPromise = import('./internal/database.client')
      .then(m => m.loadDatabaseAdapter(collections[0]!))
      .then(async (_db) => {
        db = _db

        if (hasRemovedCollections) {
          await resetFTSIndex(_db)
        }

        const toIndex = hasRemovedCollections ? collections : newCollections
        await Promise.all(toIndex.map((col) => {
          const qb = queryCollection(col as T)
          return buildFTSIndex(_db, col, qb, indexOpts)
        }))
        indexedFor = [...collections]
        status.value = 'ready'
        return _db
      })
      .catch((err) => {
        status.value = 'error'
        throw err
      })
    return initPromise
  }

  if (import.meta.client) {
    watch(() => toValue(collection), () => init(), { immediate })
  }

  async function search(query: string, searchOpts?: SearchCollectionOptions): Promise<SearchResult[]> {
    if (!db) {
      await init()
    }
    const collections = resolveCollections()
    return queryFTS(db!, collections, query, searchOpts)
  }

  return { status, search, init }
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
