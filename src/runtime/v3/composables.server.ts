import type { H3Event } from 'h3'
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
  ContentHub,
} from 'comark-content'
import type {
  SQLOperator,
  QueryGroupFunction,
  QueryField,
  SourceQueryBuilder,
} from 'comark-content/database/utils/query'
import type { SqlQueryMethods } from 'comark-content/plugins/sql-query'
import { cms } from '#imports'

type QueryableContent = (ComarkContent | ContentHub) & {
  query: SqlQueryMethods['query']
  get: ComarkContent['get']
}
type QueryBuilderFor<K extends keyof ContentRegistry> = SourceQueryBuilder<RegistryRow<K>, ContentListFile<SourceData<K>>>
type FullQueryBuilderFor<K extends keyof ContentRegistry> = FullFileQueryBuilder<RegistryRow<K>, ContentListFile<SourceData<K>>>

function asQueryable(): QueryableContent {
  return cms as QueryableContent
}

function resolveQuery(source: string) {
  const instance = asQueryable()
  if ('from' in instance && typeof (instance as ContentHub).from === 'function') {
    return (instance as ContentHub & { query: SqlQueryMethods['query'] }).query(source)
  }
  return instance.query(source)
}

/**
 * The server `cms` is a module-level singleton, so the `event` argument is not
 * required to run a query. It is kept as the first parameter to match the
 * Nuxt Content v3 server API (`queryCollection(event, collection)`), keeping
 * user code that threads the request event source-compatible.
 */
export function queryCollection<K extends keyof ContentRegistry>(event: H3Event, source: K): FullQueryBuilderFor<K>
export function queryCollection(event: H3Event, source: string): FullFileQueryBuilder<QueryRow, ContentListFile>
export function queryCollection(_event: H3Event, source: keyof ContentRegistry | string) {
  const instance = asQueryable()
  return withFullFiles(instance, resolveQuery(source as string) as SourceQueryBuilder<QueryRow, ContentListFile>)
}

export function queryCollectionNavigation<K extends keyof ContentRegistry>(
  event: H3Event,
  collection: K,
  fields?: Array<keyof SourceData<K>>,
): ChainablePromise<K, NavigationItem[]> {
  return chainablePromise(event, collection, async (qb) => {
    const list = await qb.all()
    return generateNavigation(list)
  })
}

export function queryCollectionItemSurroundings<K extends keyof ContentRegistry>(
  event: H3Event,
  collection: K,
  path: string,
  opts?: SurroundOptions,
): ChainablePromise<K, (NavigationItem | null)[]> {
  return chainablePromise(event, collection, async (qb) => {
    const list = await qb.all()
    const navigation = await generateNavigation(list)
    return generateItemSurround(navigation, path, opts)
  })
}

export function queryCollectionSearchSections<K extends keyof ContentRegistry, const F extends keyof SourceData<K>>(
  event: H3Event,
  collection: K,
  opts: Omit<GenerateSearchSectionsOptions, 'extraFields'> & { extraFields: F[] },
): ChainablePromise<K, Array<Section & Pick<SourceData<K>, F>>>
export function queryCollectionSearchSections<K extends keyof ContentRegistry>(
  event: H3Event,
  collection: K,
  opts?: GenerateSearchSectionsOptions,
): ChainablePromise<K, Section[]>
export function queryCollectionSearchSections<K extends keyof ContentRegistry>(
  event: H3Event,
  collection: K,
  opts?: GenerateSearchSectionsOptions,
) {
  return chainablePromise(event, collection, async (qb) => {
    const list = await qb.all()
    const files = await Promise.all(list.map(item => asQueryable().get(item.path)))
    const documents = files.filter((doc): doc is ContentFile => Boolean(doc))
    return generateSearchSections(documents, opts)
  })
}

interface ChainablePromise<K extends keyof ContentRegistry, R> extends Promise<R> {
  where(field: QueryField<RegistryRow<K>>, operator: SQLOperator, value?: unknown): ChainablePromise<K, R>
  andWhere(groupFactory: QueryGroupFunction<RegistryRow<K>>): ChainablePromise<K, R>
  orWhere(groupFactory: QueryGroupFunction<RegistryRow<K>>): ChainablePromise<K, R>
  order(field: QueryField<RegistryRow<K>>, direction: 'ASC' | 'DESC'): ChainablePromise<K, R>
}

function chainablePromise<K extends keyof ContentRegistry, Result>(
  _event: H3Event,
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
