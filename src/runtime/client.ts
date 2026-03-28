import type { H3Event } from 'h3'
import { collectionQueryBuilder } from './internal/query'
import { generateNavigationTree } from './internal/navigation'
import { generateItemSurround } from './internal/surround'
import { type GenerateSearchSectionsOptions, generateSearchSections } from './internal/search'
import { generateCollectionLocales } from './internal/locales'
import { fetchQuery } from './internal/api'
import type { Collections, PageCollections, CollectionQueryBuilder, ContentLocaleEntry, SurroundOptions, SQLOperator, QueryGroupFunction, ContentNavigationItem } from '@nuxt/content'
import type { AsyncData, NuxtError } from '#app'
import { tryUseNuxtApp, useAsyncData } from '#imports'

interface ChainablePromise<T extends keyof PageCollections, R> extends Promise<R> {
  where(field: keyof PageCollections[T] | string, operator: SQLOperator, value?: unknown): ChainablePromise<T, R>
  andWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): ChainablePromise<T, R>
  orWhere(groupFactory: QueryGroupFunction<PageCollections[T]>): ChainablePromise<T, R>
  order(field: keyof PageCollections[T], direction: 'ASC' | 'DESC'): ChainablePromise<T, R>
}

export const queryCollection = <T extends keyof Collections>(collection: T): CollectionQueryBuilder<Collections[T]> => {
  const nuxtApp = tryUseNuxtApp()
  const event = nuxtApp?.ssrContext?.event
  // Auto-detect locale from @nuxtjs/i18n (client: $i18n.locale, SSR: event.context.nuxtI18n)
  const detectedLocale = (nuxtApp?.$i18n as { locale?: { value?: string } })?.locale?.value
    || (event?.context?.nuxtI18n as { vueI18nOptions?: { locale?: string } })?.vueI18nOptions?.locale
  return collectionQueryBuilder<T>(collection, (collection, sql) => executeContentQuery(event, collection, sql), detectedLocale)
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

export function queryCollectionLocales<T extends keyof Collections>(collection: T, stem: string): Promise<ContentLocaleEntry[]> {
  // Skip auto-locale: this helper needs ALL locale variants, not just the current one
  const event = tryUseNuxtApp()?.ssrContext?.event
  const qb = collectionQueryBuilder<T>(collection, (collection, sql) => executeContentQuery(event, collection, sql))
  return generateCollectionLocales(qb, stem)
}

/**
 * useAsyncData wrapper for queryCollection.
 * Provides a chainable API that auto-wraps execution in useAsyncData
 * with an auto-generated cache key.
 *
 * @example
 * const { data } = await useQueryCollection('technologies').all()
 * const { data } = await useQueryCollection('navigation').stem('navbar').first()
 */
export function useQueryCollection<T extends keyof Collections>(collection: T) {
  const qb = queryCollection(collection)

  type Item = Collections[T]

  const builder = {
    where(field: string, operator: SQLOperator, value?: unknown) {
      qb.where(field, operator, value)
      return builder
    },
    andWhere(groupFactory: QueryGroupFunction<Item>) {
      qb.andWhere(groupFactory)
      return builder
    },
    orWhere(groupFactory: QueryGroupFunction<Item>) {
      qb.orWhere(groupFactory)
      return builder
    },
    order(field: keyof Item, direction: 'ASC' | 'DESC') {
      qb.order(field, direction)
      return builder
    },
    select<K extends keyof Item>(...fields: K[]) {
      qb.select(...fields)
      return builder
    },
    skip(skip: number) {
      qb.skip(skip)
      return builder
    },
    limit(limit: number) {
      qb.limit(limit)
      return builder
    },
    path(path: string) {
      qb.path(path)
      return builder
    },
    stem(stem: string) {
      qb.stem(stem)
      return builder
    },
    locale(locale: string, opts?: { fallback?: string }) {
      qb.locale(locale, opts)
      return builder
    },
    all(): AsyncData<Item[], NuxtError> {
      const key = generateKey(collection, qb)
      return useAsyncData(key, () => qb.all()) as AsyncData<Item[], NuxtError>
    },
    first(): AsyncData<Item | null, NuxtError> {
      const key = generateKey(collection, qb)
      return useAsyncData(key, () => qb.first()) as AsyncData<Item | null, NuxtError>
    },
    count(field?: keyof Item | '*', distinct?: boolean): AsyncData<number, NuxtError> {
      const key = generateKey(collection, qb)
      return useAsyncData(key, () => qb.count(field, distinct)) as AsyncData<number, NuxtError>
    },
  }

  return builder
}

function generateKey<T extends keyof Collections>(collection: T, qb: CollectionQueryBuilder<Collections[T]>): string {
  // Use internal params to build a stable cache key
  const params = (qb as unknown as { __params: Record<string, unknown> }).__params
  const parts = [String(collection)]
  const conditions = params.conditions as string[]
  if (conditions?.length) parts.push(...conditions)
  const fallback = params.localeFallback as { locale: string } | undefined
  if (fallback) parts.push(`locale:${fallback.locale}`)
  return `content:${parts.join(':')}`
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
