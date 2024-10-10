import type { Collections } from '@nuxt/content'
import { measurePerformance } from './internal/performance'
import { parseJsonFields } from './internal/parseJsonFields'

export async function executeContentQuery<T extends keyof Collections, Result = Collections[T]>(collection: T, sql: string) {
  let result: Array<Result>
  if (import.meta.client) {
    result = await queryContentSqlClientWasm<Result>(collection, sql)
  }
  else {
    result = await queryContentSqlApi<Result>(collection, sql)
  }

  return result
}

function queryContentSqlApi<T>(collection: keyof Collections, sql: string) {
  return $fetch<T[]>(`/api/${String(collection)}/query`, {
    method: 'POST',
    body: {
      query: sql,
    },
  })
}

async function queryContentSqlClientWasm<T>(collection: keyof Collections, sql: string) {
  const perf = measurePerformance()
  const db = await import('./internal/app.client').then(m => m.prepareLocalDatabase())

  const jsonFields = db.collections?.[String(collection)]?.jsonFields || ['body', 'meta'] as string[]
  const rows = db
    .exec({ sql, rowMode: 'object', returnValue: 'resultRows' })
    .map(row => parseJsonFields(row, jsonFields))

  perf.tick('Execute Query')

  console.log(perf.end('Run with Compressed Dump'))

  return rows as T[]
}
