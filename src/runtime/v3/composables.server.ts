import type { H3Event } from 'h3'
import { generateNavigationTree } from '@comark/cms/utils'
import { withFullFiles, type FullFileQueryBuilder } from './query'
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
type QueryBuilderFor<K extends keyof ComarkRegistry> = SourceQueryBuilder<RegistryRow<K>, CMSListFile<SourceData<K>>>
type FullQueryBuilderFor<K extends keyof ComarkRegistry> = FullFileQueryBuilder<RegistryRow<K>, CMSListFile<SourceData<K>>>

/**
 * The server `cms` is a module-level singleton, so the `event` argument is not
 * required to run a query. It is kept as the first parameter to match the
 * Nuxt Content v3 server API (`queryCollection(event, collection)`), keeping
 * user code that threads the request event source-compatible.
 */
export function queryCollection<K extends keyof ComarkRegistry>(event: H3Event, source: K): FullQueryBuilderFor<K>
export function queryCollection(event: H3Event, source: string): FullFileQueryBuilder<QueryRow, CMSListFile>
export function queryCollection(_event: H3Event, source: keyof ComarkRegistry | string) {
  const cmsInstance = cms as QueryableCMS
  return withFullFiles(cmsInstance, cmsInstance.query(source as keyof ComarkRegistry))
}

export function queryCollectionNavigation<K extends keyof ComarkRegistry>(
  event: H3Event,
  collection: K,
  fields?: Array<keyof SourceData<K>>,
): ChainablePromise<K, NavigationItem[]> {
  return chainablePromise(event, collection, async (qb) => {
    const list = await qb.all()
    return generateNavigationTree(list)
  })
}

export function queryCollectionItemSurroundings<K extends keyof ComarkRegistry>(
  event: H3Event,
  collection: K,
  path: string,
  opts?: SurroundOptions,
): ChainablePromise<K, (NavigationItem | null)[]> {
  return chainablePromise(event, collection, async (qb) => {
    const list = await qb.all()
    const navigation = await generateNavigationTree(list)
    return generateItemSurround(navigation, path, opts)
  })
}

export function queryCollectionSearchSections<K extends keyof ComarkRegistry, const F extends keyof SourceData<K>>(
  event: H3Event,
  collection: K,
  opts: Omit<GenerateSearchSectionsOptions, 'extraFields'> & { extraFields: F[] },
): ChainablePromise<K, Array<Section & Pick<SourceData<K>, F>>>
export function queryCollectionSearchSections<K extends keyof ComarkRegistry>(
  event: H3Event,
  collection: K,
  opts?: GenerateSearchSectionsOptions,
): ChainablePromise<K, Section[]>
export function queryCollectionSearchSections<K extends keyof ComarkRegistry>(
  event: H3Event,
  collection: K,
  opts?: GenerateSearchSectionsOptions,
) {
  return chainablePromise(event, collection, async (qb) => {
    const list = await qb.all()
    const files = await Promise.all(list.map(item => (cms as QueryableCMS).get(item.path)))
    const documents = files.filter((doc): doc is CMSFile => Boolean(doc))
    return generateSearchSections(documents, opts)
  })
}

interface ChainablePromise<K extends keyof ComarkRegistry, R> extends Promise<R> {
  where(field: QueryField<RegistryRow<K>>, operator: SQLOperator, value?: unknown): ChainablePromise<K, R>
  andWhere(groupFactory: QueryGroupFunction<RegistryRow<K>>): ChainablePromise<K, R>
  orWhere(groupFactory: QueryGroupFunction<RegistryRow<K>>): ChainablePromise<K, R>
  order(field: QueryField<RegistryRow<K>>, direction: 'ASC' | 'DESC'): ChainablePromise<K, R>
}

function chainablePromise<K extends keyof ComarkRegistry, Result>(
  _event: H3Event,
  collection: K,
  fn: (qb: QueryBuilderFor<K>) => Promise<Result>,
) {
  // Navigation/surroundings/search only need the lightweight rows, so they use
  // the raw query builder rather than the body-hydrating `queryCollection`.
  const queryBuilder = (cms as QueryableCMS).query(collection) as QueryBuilderFor<K>

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
