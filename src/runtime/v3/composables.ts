import { ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { generateNavigationTree } from '@comark/cms/utils'
import { generateItemSurround, type SurroundOptions } from './surround'
import { generateSearchSections, type GenerateSearchSectionsOptions, type Section } from './search'
import type {
  ComarkCMS,
  ComarkRegistry,
  RegistryRow,
  SourceData,
  NavigationItem,
  CMSListFile,
  CMSFile,
  QueryRow,
  SearchOptions,
  SearchResult,
} from '@comark/cms'
import type {
  SQLOperator,
  QueryGroupFunction,
  QueryField,
  SourceQueryBuilder,
} from '@comark/cms/database/utils/query'
import type { SqlQueryMethods } from '@comark/cms/plugins/sql-query'
import { cms } from '#imports'

type QueryableCMS = ComarkCMS & SqlQueryMethods
type SearchableCMS = QueryableCMS & {
  search: (sources: string[], query: string, opts?: SearchOptions) => Promise<SearchResult[]>
}
type QueryBuilderFor<K extends keyof ComarkRegistry> = SourceQueryBuilder<RegistryRow<K>, CMSListFile<SourceData<K>>>

export function queryCollection<K extends keyof ComarkRegistry>(source: K): QueryBuilderFor<K>
export function queryCollection(source: string): SourceQueryBuilder<QueryRow, CMSListFile>
export function queryCollection(source: keyof ComarkRegistry | string) {
  return (cms as QueryableCMS).query(source as keyof ComarkRegistry)
}

export function queryCollectionNavigation<K extends keyof ComarkRegistry>(
  collection: K,
  fields?: Array<keyof SourceData<K>>,
): ChainablePromise<K, NavigationItem[]> {
  return chainablePromise(collection, async (qb) => {
    const list = await qb.all()
    return generateNavigationTree(list)
  })
}

export function queryCollectionItemSurroundings<K extends keyof ComarkRegistry>(
  collection: K,
  path: string,
  opts?: SurroundOptions,
): ChainablePromise<K, (NavigationItem | null)[]> {
  return chainablePromise(collection, async (qb) => {
    const list = await qb.all()
    const navigation = await generateNavigationTree(list)
    return generateItemSurround(navigation, path, opts)
  })
}

export function queryCollectionSearchSections<K extends keyof ComarkRegistry, const F extends keyof SourceData<K>>(
  collection: K,
  opts: Omit<GenerateSearchSectionsOptions, 'extraFields'> & { extraFields: F[] },
): ChainablePromise<K, Array<Section & Pick<SourceData<K>, F>>>
export function queryCollectionSearchSections<K extends keyof ComarkRegistry>(
  collection: K,
  opts?: GenerateSearchSectionsOptions,
): ChainablePromise<K, Section[]>
export function queryCollectionSearchSections<K extends keyof ComarkRegistry>(
  collection: K,
  opts?: GenerateSearchSectionsOptions,
) {
  return chainablePromise(collection, async (qb) => {
    const list = await qb.all()
    const files = await Promise.all(list.map(item => (cms as QueryableCMS).get(item.path)))
    const documents = files.filter((doc): doc is CMSFile => Boolean(doc))
    return generateSearchSections(documents, opts)
  })
}

export function useSearchCollection<T extends keyof ComarkRegistry>(
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
    // An empty query warms the index without returning hits: comark indexes each
    // requested source before it bails on the empty search term.
    initPromise = (cms as SearchableCMS).search(collections, '')
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
    return (cms as SearchableCMS).search(resolveCollections(), query, searchOpts)
  }

  return { status, search, init }
}

interface ChainablePromise<K extends keyof ComarkRegistry, R> extends Promise<R> {
  where(field: QueryField<RegistryRow<K>>, operator: SQLOperator, value?: unknown): ChainablePromise<K, R>
  andWhere(groupFactory: QueryGroupFunction<RegistryRow<K>>): ChainablePromise<K, R>
  orWhere(groupFactory: QueryGroupFunction<RegistryRow<K>>): ChainablePromise<K, R>
  order(field: QueryField<RegistryRow<K>>, direction: 'ASC' | 'DESC'): ChainablePromise<K, R>
}

function chainablePromise<K extends keyof ComarkRegistry, Result>(
  collection: K,
  fn: (qb: QueryBuilderFor<K>) => Promise<Result>,
) {
  const queryBuilder = queryCollection(collection)

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
