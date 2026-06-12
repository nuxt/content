import type { H3Event } from 'h3'
import { collectionQueryBuilder, collectionQueryGroup } from './internal/query'
import { generateNavigationTree } from './internal/navigation'
import { generateItemSurround } from './internal/surround'
import type { GenerateSearchSectionsOptions, SearchCollectionOptions, SearchResult } from './internal/search'
import { buildFTSIndex, generateSearchSections, queryFTS, resetFTSIndex } from './internal/search'
import { generateCollectionLocales } from './internal/locales'
import { fetchQuery } from './internal/api'
import type { Collections, ContentLocaleEntry, ContentNavigationItem, CollectionQueryBuilder, DatabaseAdapter, PageCollections, QueryGroupFunction, SQLOperator, SurroundOptions } from '@nuxt/content'
import type { AsyncData, NuxtError } from '#app'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, ref, toValue, tryUseNuxtApp, useAsyncData, watch } from '#imports'

export type { GenerateSearchSectionsOptions, SearchCollectionOptions, SearchResult } from './internal/search'

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
    || (event?.context?.nuxtI18n as { locale?: string })?.locale
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
 * with an auto-generated cache key. Locale is auto-detected from @nuxtjs/i18n
 * and content automatically re-fetches when the locale changes.
 *
 * Must be called in a Vue component setup context (like useAsyncData, useFetch).
 *
 * @example
 * const { data } = await useQueryCollection('technologies').all()
 * const { data } = await useQueryCollection('navigation').stem('navbar').first()
 */
export function useQueryCollection<R = never, T extends keyof Collections = keyof Collections>(collection: T) {
  const nuxtApp = tryUseNuxtApp()
  if (!nuxtApp) {
    // useAsyncData would throw the same way; surface the cause earlier so users
    // get a clear hint about *where* the call is misplaced rather than a generic
    // "[nuxt] instance unavailable" trace from inside useAsyncData.
    throw new Error(
      '[@nuxt/content] `useQueryCollection` must be called inside a Vue component setup (or other Nuxt-aware) context, '
      + 'like `useAsyncData` and `useFetch`. It cannot run in event handlers, watchers, lifecycle hooks, '
      + 'or outside the Nuxt app.',
    )
  }
  const i18nLocaleRef = (nuxtApp?.$i18n as { locale?: Ref<string> })?.locale
  // Reactive locale for cache key and watch
  const localeValue = computed(() => i18nLocaleRef?.value || '')

  type Item = Collections[T]
  // Use the consumer's type override if provided, otherwise the collection type
  type Result = [R] extends [never] ? Item : R

  // Collect query chain operations to replay on each execution
  const ops: Array<(qb: CollectionQueryBuilder<Item>) => void> = []
  let explicitLocale = false

  // Track key-relevant params directly, which avoids creating a full query builder in buildKey
  const keyParts = {
    conditions: [] as string[],
    orderBy: [] as string[],
    offset: 0,
    limit: 0,
    selectedFields: [] as string[],
    localeFallback: undefined as { locale: string, fallback: string } | undefined,
  }

  const builder = {
    where(field: string, operator: SQLOperator, value?: unknown) {
      keyParts.conditions.push(`${field}${operator}${value}`)
      ops.push(qb => qb.where(field, operator, value))
      return builder
    },
    andWhere(groupFactory: QueryGroupFunction<Item>) {
      const group = groupFactory(collectionQueryGroup(collection))
      const cond = (group as unknown as { _conditions: string[] })._conditions.join(' AND ')
      keyParts.conditions.push(`and(${cond})`)
      ops.push(qb => qb.andWhere(groupFactory))
      return builder
    },
    orWhere(groupFactory: QueryGroupFunction<Item>) {
      const group = groupFactory(collectionQueryGroup(collection))
      const cond = (group as unknown as { _conditions: string[] })._conditions.join(' OR ')
      keyParts.conditions.push(`or(${cond})`)
      ops.push(qb => qb.orWhere(groupFactory))
      return builder
    },
    order(field: keyof Item, direction: 'ASC' | 'DESC') {
      keyParts.orderBy.push(`${String(field)}:${direction}`)
      ops.push(qb => qb.order(field, direction))
      return builder
    },
    select<K extends keyof Item>(...fields: K[]) {
      keyParts.selectedFields.push(...fields.map(String))
      ops.push(qb => qb.select(...fields))
      return builder
    },
    skip(skip: number) {
      keyParts.offset = skip
      ops.push(qb => qb.skip(skip))
      return builder
    },
    limit(limit: number) {
      keyParts.limit = limit
      ops.push(qb => qb.limit(limit))
      return builder
    },
    path(path: string) {
      keyParts.conditions.push(`path=${path}`)
      ops.push(qb => qb.path(path))
      return builder
    },
    stem(stem: string) {
      keyParts.conditions.push(`stem=${stem}`)
      ops.push(qb => qb.stem(stem))
      return builder
    },
    locale(locale: string, opts?: { fallback?: string }) {
      explicitLocale = true
      if (opts?.fallback) {
        keyParts.localeFallback = { locale, fallback: opts.fallback }
      }
      else {
        keyParts.conditions.push(`locale=${locale}`)
      }
      ops.push(qb => qb.locale(locale, opts))
      return builder
    },
    all(): AsyncData<Result[] | undefined, NuxtError | undefined> {
      return useAsyncData(() => buildKey('all'), () => buildQuery().all(), { watch: watchSources() }) as AsyncData<Result[] | undefined, NuxtError | undefined>
    },
    first(): AsyncData<Result | null | undefined, NuxtError | undefined> {
      return useAsyncData(() => buildKey('first'), () => buildQuery().first(), { watch: watchSources() }) as AsyncData<Result | null | undefined, NuxtError | undefined>
    },
    count(field?: keyof Item | '*', distinct?: boolean): AsyncData<number | undefined, NuxtError | undefined> {
      const countKey = `count:${String(field ?? '*')}:${distinct ? 'd' : ''}`
      return useAsyncData(() => buildKey(countKey), () => buildQuery().count(field, distinct), { watch: watchSources() }) as AsyncData<number | undefined, NuxtError | undefined>
    },
  }

  function watchSources() {
    return !explicitLocale && i18nLocaleRef ? [i18nLocaleRef] : undefined
  }

  /** Rebuild a fresh query builder with all chained ops replayed. */
  function buildQuery(): CollectionQueryBuilder<Item> {
    const qb = queryCollection(collection)
    for (const op of ops) op(qb)
    return qb
  }

  /** Build cache key from tracked params without instantiating a query builder. */
  function buildKey(method: string): string {
    const parts = [String(collection)]
    if (keyParts.conditions.length) parts.push(...keyParts.conditions)
    if (keyParts.localeFallback) parts.push(`l:${keyParts.localeFallback.locale}:fb:${keyParts.localeFallback.fallback}`)
    else if (localeValue.value && !explicitLocale) parts.push(`l:${localeValue.value}`)
    if (keyParts.orderBy.length) parts.push(`o:${keyParts.orderBy.join(',')}`)
    if (keyParts.offset) parts.push(`s:${keyParts.offset}`)
    if (keyParts.limit) parts.push(`n:${keyParts.limit}`)
    if (keyParts.selectedFields.length) parts.push(`f:${keyParts.selectedFields.join(',')}`)
    parts.push(method)
    return `content:${JSON.stringify(parts)}`
  }

  return builder
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
    if (!collections.length) return initPromise ?? (db ? Promise.resolve(db) : Promise.reject(new Error('No collections to search')))

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
    return queryFTS(db!, indexedFor, query, searchOpts)
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
