import { generateNavigationTree } from '@comark/cms/utils'
import { generateItemSurround, type SurroundOptions } from './surround'
import type {
  ComarkCMS,
  ComarkRegistry,
  RegistryRow,
  SourceData,
  NavigationItem,
  CMSListFile,
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
