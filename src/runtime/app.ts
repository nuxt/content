import type { Collections, PageCollections, CollectionQueryBuilder, SurroundOptions } from '@nuxt/content'
import { collectionQureyBuilder } from './internal/query'
import { measurePerformance } from './internal/performance'
import { generateNavigationTree } from './internal/navigation'
import { generateItemSurround } from './internal/surround'
import { generateSearchSections } from './internal/search'
import { fetchQuery } from './internal/api'
import { tryUseNuxtApp } from '#imports'

export const queryCollection = <T extends keyof Collections>(collection: T): CollectionQueryBuilder<Collections[T]> => {
  return collectionQureyBuilder<T>(collection, (collection, sql) => executeContentQuery(collection, sql))
}

export async function queryCollectionNavigation<T extends keyof PageCollections>(collection: T, fields?: Array<keyof PageCollections[T]>) {
  return generateNavigationTree(queryCollection(collection), fields as string[])
}

export async function queryCollectionItemSurroundings<T extends keyof PageCollections>(collection: T, path: string, opts?: SurroundOptions<keyof PageCollections[T]>) {
  return generateItemSurround(queryCollection(collection), path, opts)
}

export async function queryCollectionSearchSections(collection: keyof Collections, opts?: { ignoredTags: string[] }) {
  return generateSearchSections(queryCollection(collection), opts)
}

async function executeContentQuery<T extends keyof Collections, Result = Collections[T]>(collection: T, sql: string) {
  if (import.meta.client) {
    return await queryContentSqlClientWasm<T, Result>(collection, sql)
  }
  else {
    return await fetchQuery(tryUseNuxtApp()?.ssrContext?.event, String(collection), sql)
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
