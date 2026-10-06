import { ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { generateNavigation } from 'comark-content/utils'
import { withFullFiles, type FullFileQueryBuilder } from './query'
import { generateItemSurround, type SurroundOptions } from './surround'
import { generateSearchSections, type GenerateSearchSectionsOptions, type Section } from './search'
import type {
  ComarkContent,
  ContentRegistry,
  RegistryRow,
  SourceData,
  NavigationItem,
  ContentListFile,
  ContentFile,
  QueryRow,
  SearchOptions,
  SearchResult,
  ContentHub,
} from 'comark-content'
import type {
  SQLOperator,
  QueryGroupFunction,
  QueryField,
  SourceQueryBuilder,
} from 'comark-content/database/utils/query'
import type { SqlQueryMethods } from 'comark-content/plugins/sql-query'
import { content } from '#imports'

type QueryableContent = (ComarkContent | ContentHub) & {
  query: SqlQueryMethods['query']
  get: ComarkContent['get']
}
type SearchableContent = QueryableContent & {
  // Instance API: search(query, opts). Hub API: search(query, opts & { instances }).
  // Internal FTS surface also supports searchAcross(sources, query, opts).
  search: ((query: string, opts?: SearchOptions) => Promise<SearchResult[]>)
    & ((sources: string[], query: string, opts?: SearchOptions) => Promise<SearchResult[]>)
  __fts__?: {
    searchAcross: (sources: string[], query: string, opts?: SearchOptions) => Promise<SearchResult[]>
  }
}
type QueryBuilderFor<K extends keyof ContentRegistry> = SourceQueryBuilder<RegistryRow<K>, ContentListFile<SourceData<K>>>
type FullQueryBuilderFor<K extends keyof ContentRegistry> = FullFileQueryBuilder<RegistryRow<K>, ContentListFile<SourceData<K>>>

function asQueryable(): QueryableContent {
  return content as unknown as QueryableContent
}

function resolveQuery(source: string) {
  const instance = asQueryable()
  // Hub: query(name). Single instance: query() scoped to itself — pass the name for typing.
  if ('from' in instance && typeof (instance as ContentHub).from === 'function') {
    return (instance as ContentHub & { query: SqlQueryMethods['query'] }).query(source)
  }
  return instance.query(source)
}

export function queryCollection<K extends keyof ContentRegistry>(source: K): FullQueryBuilderFor<K>
export function queryCollection(source: string): FullFileQueryBuilder<QueryRow, ContentListFile>
export function queryCollection(source: keyof ContentRegistry | string) {
  const instance = asQueryable()
  return withFullFiles(instance, resolveQuery(source as string) as SourceQueryBuilder<QueryRow, ContentListFile>)
}

export function queryCollectionNavigation<K extends keyof ContentRegistry>(
  collection: K,
  _fields?: Array<keyof SourceData<K>>,
): ChainablePromise<K, NavigationItem[]> {
  return chainablePromise(collection, async (qb) => {
    const list = await qb.all()
    return generateNavigation(list)
  })
}

export function queryCollectionItemSurroundings<K extends keyof ContentRegistry>(
  collection: K,
  path: string,
  opts?: SurroundOptions,
): ChainablePromise<K, (NavigationItem | null)[]> {
  return chainablePromise(collection, async (qb) => {
    const list = await qb.all()
    const navigation = await generateNavigation(list)
    return generateItemSurround(navigation, path, opts)
  })
}

export function queryCollectionSearchSections<K extends keyof ContentRegistry, const F extends keyof SourceData<K>>(
  collection: K,
  opts: Omit<GenerateSearchSectionsOptions, 'extraFields'> & { extraFields: F[] },
): ChainablePromise<K, Array<Section & Pick<SourceData<K>, F>>>
export function queryCollectionSearchSections<K extends keyof ContentRegistry>(
  collection: K,
  opts?: GenerateSearchSectionsOptions,
): ChainablePromise<K, Section[]>
export function queryCollectionSearchSections<K extends keyof ContentRegistry>(
  collection: K,
  opts?: GenerateSearchSectionsOptions,
) {
  return chainablePromise(collection, async (qb) => {
    const list = await qb.all()
    const files = await Promise.all(list.map(item => asQueryable().get(item.path)))
    const documents = files.filter((doc): doc is ContentFile => Boolean(doc))
    return generateSearchSections(documents, opts)
  })
}

export function useSearchCollection<T extends keyof ContentRegistry>(
  collection: MaybeRefOrGetter<T | T[]>,
  opts?: GenerateSearchSectionsOptions & { immediate?: boolean },
) {
  // Only `immediate` is consumed here: with the comark FTS engine, indexing
  // (ignoredTags/minHeading/… ) happens inside the plugin at index time, so the
  // remaining `GenerateSearchSectionsOptions` are kept for v3 API parity only.
  const { immediate = true } = opts || {}
  const status = ref<'idle' | 'loading' | 'ready' | 'error'>(immediate ? 'loading' : 'idle')

  let initPromise: Promise<void> | undefined
  let indexedFor: string[] = []

  function resolveCollections() {
    const value = toValue(collection)
    return (Array.isArray(value) ? value : [value]).map(String)
  }

  async function searchAcross(collections: string[], query: string, searchOpts?: SearchOptions) {
    const searchable = content as unknown as SearchableContent
    if (searchable.__fts__?.searchAcross) {
      return searchable.__fts__.searchAcross(collections, query, searchOpts)
    }
    // Hub search takes (query, { instances }).
    if ('from' in searchable && typeof (searchable as ContentHub).from === 'function') {
      return (searchable as ContentHub).search(query, { ...searchOpts, instances: collections })
    }
    // Single-instance search takes (query, opts) only.
    return searchable.search(query, searchOpts)
  }

  async function init() {
    const collections = resolveCollections()
    if (!collections.length) {
      return initPromise
    }

    const alreadyIndexed = collections.length === indexedFor.length
      && collections.every(c => indexedFor.includes(c))
    if (alreadyIndexed && initPromise) {
      return initPromise
    }

    status.value = 'loading'
    // An empty query warms the index without returning hits.
    initPromise = searchAcross(collections, '')
      .then(() => {
        indexedFor = collections
        status.value = 'ready'
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

  async function search(query: string, searchOpts?: SearchOptions): Promise<SearchResult[]> {
    if (status.value !== 'ready') {
      await init()
    }
    return searchAcross(resolveCollections(), query, searchOpts)
  }

  return { status, search, init }
}

interface ChainablePromise<K extends keyof ContentRegistry, R> extends Promise<R> {
  where(field: QueryField<RegistryRow<K>>, operator: SQLOperator, value?: unknown): ChainablePromise<K, R>
  andWhere(groupFactory: QueryGroupFunction<RegistryRow<K>>): ChainablePromise<K, R>
  orWhere(groupFactory: QueryGroupFunction<RegistryRow<K>>): ChainablePromise<K, R>
  order(field: QueryField<RegistryRow<K>>, direction: 'ASC' | 'DESC'): ChainablePromise<K, R>
}

function chainablePromise<K extends keyof ContentRegistry, Result>(
  collection: K,
  fn: (qb: QueryBuilderFor<K>) => Promise<Result>,
) {
  // Navigation/surroundings/search only need the lightweight rows, so they use
  // the raw query builder rather than the body-hydrating `queryCollection`.
  const queryBuilder = resolveQuery(collection as string) as QueryBuilderFor<K>

  const chainable: ChainablePromise<K, Result> = {
    where(field, operator, value) {
      queryBuilder.where(field, operator, value)
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
      queryBuilder.order(field, direction)
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
