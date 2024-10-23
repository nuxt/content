import type { Collections, PageCollections, CollectionQueryBuilder, SurroundOptions } from '@nuxt/content'
import { collectionQureyBuilder, executeContentQueryWithEvent } from './internal/query'
import { measurePerformance } from './internal/performance'
import { generateNavigationTree } from './internal/navigation'
import { generateItemSurround } from './internal/surround'
import { generateSearchSections } from './internal/search'
import { tryUseNuxtApp } from '#imports'

export const queryCollection = <T extends keyof Collections>(collection: T): CollectionQueryBuilder<Collections[T]> => {
  return collectionQureyBuilder<T>(collection, sql => executeContentQuery(sql))
}

export async function queryCollectionNavigation<T extends keyof PageCollections>(collection: T, fields?: Array<keyof PageCollections[T]>) {
  return generateNavigationTree(queryCollection(collection), fields)
}

export async function queryCollectionItemSurroundings<T extends keyof PageCollections>(collection: T, path: string, opts?: SurroundOptions<keyof PageCollections[T]>) {
  return generateItemSurround(queryCollection(collection), path, opts)
}

export async function queryCollectionSearchSections(collection: keyof Collections, opts?: { ignoredTags: string[] }) {
  return generateSearchSections(queryCollection(collection), opts)
}

async function executeContentQuery<T extends keyof Collections, Result = Collections[T]>(sql: string) {
  let result: Array<Result>
  if (import.meta.client) {
    result = await queryContentSqlClientWasm<Result>(sql)
  }
  else {
    const event = tryUseNuxtApp()?.ssrContext?.event
    result = await executeContentQueryWithEvent<T>(event!, sql)
  }

  return result
}

async function queryContentSqlClientWasm<T>(sql: string) {
  const perf = measurePerformance()
  const db = await import('./internal/database.client').then(m => m.loadDatabaseAdapter())
  const rows = await db.all<T>(sql)

  perf.tick('Execute Query')

  console.log(perf.end('Run with Compressed Dump'))

  return rows as T[]
}
