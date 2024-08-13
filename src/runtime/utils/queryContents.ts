import type { ContentQueryBuilder, SQLOperator } from '@farnabaz/content-next'
import { executeContentQuery } from './executeContentQuery'

export const queryContents = <T = Record<string, unknown>>(collection: string) => {
  const params = {
    conditions: [] as Array<string>,
    selectedFields: [] as Array<keyof T>,
    offset: 0,
    limit: 0,
  }

  const query: ContentQueryBuilder<T> = {
    path(path: string) {
      return query.where('path', '=', path)
    },
    skip(skip: number) {
      params.offset = skip
      return query
    },
    where(field: string, operator: SQLOperator, value: unknown): ContentQueryBuilder<T> {
      let condition: string

      switch (operator.toUpperCase()) {
        case 'IN':
        case 'NOT IN':
          if (Array.isArray(value)) {
            const values = value.map(val => `'${val}'`).join(', ')
            condition = `${field} ${operator.toUpperCase()} (${values})`
          }
          else {
            throw new TypeError(`Value for ${operator} must be an array`)
          }
          break

        case 'BETWEEN':
        case 'NOT BETWEEN':
          if (Array.isArray(value) && value.length === 2) {
            condition = `${field} ${operator.toUpperCase()} '${value[0]}' AND '${value[1]}'`
          }
          else {
            throw new Error(`Value for ${operator} must be an array with two elements`)
          }
          break

        case 'IS NULL':
        case 'IS NOT NULL':
          condition = `${field} ${operator.toUpperCase()}`
          break

        case 'LIKE':
        case 'NOT LIKE':
          condition = `${field} ${operator.toUpperCase()} '${value}'`
          break

        default:
          condition = `${field} ${operator} '${value}'`
      }
      params.conditions.push(`(${condition})`)
      return query
    },
    limit(limit: number) {
      params.limit = limit
      return query
    },
    select<K extends keyof T>(...fields: K[]) {
      params.selectedFields.push(...fields)
      return query
    },
    async all(): Promise<T[]> {
      return executeContentQuery(collection, buildQuery())
    },
    async first(): Promise<T> {
      return executeContentQuery(collection, buildQuery()).then(res => res[0])
    },
  }

  function buildQuery() {
    let query = 'SELECT '
    query += params.selectedFields.length > 0 ? params.selectedFields.join(', ') : '*'
    query += ` FROM ${collection}`

    if (params.conditions.length > 0) {
      query += ` WHERE ${params.conditions.join(' AND ')}`
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
