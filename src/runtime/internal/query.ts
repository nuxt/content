import type { Collections, CollectionQueryBuilder, SQLOperator } from '@nuxt/content'
import type { H3Event } from 'h3'
import loadDatabaseAdapter from './database.server'
import { integrityVersion, tables } from '#content/manifest'
import { useRuntimeConfig } from '#imports'

export const collectionQureyBuilder = <T extends keyof Collections>(collection: T, fetch: (sql: string) => Promise<T[]>): CollectionQueryBuilder<Collections[T]> => {
  const params = {
    conditions: [] as Array<string>,
    selectedFields: [] as Array<keyof Collections[T]>,
    offset: 0,
    limit: 0,
    orderBy: [] as Array<string>,
  }

  const query: CollectionQueryBuilder<Collections[T]> = {
    path(path: string) {
      return query.where('path', '=', path)
    },
    skip(skip: number) {
      params.offset = skip
      return query
    },
    where(field: keyof Collections[T] | string, operator: SQLOperator, value: unknown): CollectionQueryBuilder<Collections[T]> {
      let condition: string

      switch (operator.toUpperCase()) {
        case 'IN':
        case 'NOT IN':
          if (Array.isArray(value)) {
            const values = value.map(val => `'${val}'`).join(', ')
            condition = `"${String(field)}" ${operator.toUpperCase()} (${values})`
          }
          else {
            throw new TypeError(`Value for ${operator} must be an array`)
          }
          break

        case 'BETWEEN':
        case 'NOT BETWEEN':
          if (Array.isArray(value) && value.length === 2) {
            condition = `"${String(field)}" ${operator.toUpperCase()} '${value[0]}' AND '${value[1]}'`
          }
          else {
            throw new Error(`Value for ${operator} must be an array with two elements`)
          }
          break

        case 'IS NULL':
        case 'IS NOT NULL':
          condition = `"${String(field)}" ${operator.toUpperCase()}`
          break

        case 'LIKE':
        case 'NOT LIKE':
          condition = `"${String(field)}" ${operator.toUpperCase()} '${value}'`
          break

        default:
          condition = `"${String(field)}" ${operator} '${value}'`
      }
      params.conditions.push(`(${condition})`)
      return query
    },
    limit(limit: number) {
      params.limit = limit
      return query
    },
    select<K extends keyof Collections[T]>(...fields: K[]) {
      if (fields.length) {
        params.selectedFields.push(...fields)
      }
      return query
    },
    order(field: keyof Collections[T], direction: 'ASC' | 'DESC') {
      params.orderBy.push(`"${String(field)}" ${direction}`)
      return query
    },
    async all(): Promise<Collections[T][]> {
      return fetch(buildQuery()).then(res => res || [])
    },
    async first(): Promise<Collections[T]> {
      return fetch(buildQuery()).then(res => res[0] || null)
    },
  }

  function buildQuery() {
    let query = 'SELECT '
    query += params.selectedFields.length > 0 ? params.selectedFields.map(f => `"${String(f)}"`).join(', ') : '*'
    query += ` FROM ${tables[String(collection)]}`

    if (params.conditions.length > 0) {
      query += ` WHERE ${params.conditions.join(' AND ')}`
    }

    if (params.orderBy.length > 0) {
      query += ` ORDER BY ${params.orderBy.join(', ')}`
    }
    else {
      query += ` ORDER BY stem ASC`
    }

    if (params.limit > 0) {
      if (params.offset > 0) {
        query += ` LIMIT ${params.limit} OFFSET ${params.offset}`
      }
      query += ` LIMIT ${params.limit}`
    }

    return query
  }

  return query
}

let checkDatabaseIntegrity = true
let integrityCheckPromise: Promise<void> | null = null
export async function executeContentQueryWithEvent<T extends keyof Collections, Result = Collections[T]>(event: H3Event, sql: string): Promise<Result[]> {
  const conf = useRuntimeConfig().content

  if (import.meta.server && event) {
    if (checkDatabaseIntegrity) {
      checkDatabaseIntegrity = false
      integrityCheckPromise = integrityCheckPromise || import('./database.server')
        .then(m => m.checkAndImportDatabaseIntegrity(event, integrityVersion, conf))
        .then((isValid) => { checkDatabaseIntegrity = !isValid })
        .catch((error) => {
          console.log('Database integrity check failed, rebuilding database', error)
          checkDatabaseIntegrity = true
          integrityCheckPromise = null
        })
    }

    if (integrityCheckPromise) {
      await integrityCheckPromise
    }
  }

  return loadDatabaseAdapter(conf).all<T>(sql)
}
