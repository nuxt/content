import type { CollectionQueryBuilder, SQLOperator, Collections } from '@farnabaz/content-next'
import { executeContentQuery } from './executeContentQuery'

export const queryCollection = <T extends keyof Collections>(collection: T): CollectionQueryBuilder<Collections[T]> => {
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
            condition = `\`${String(field)}\` ${operator.toUpperCase()} (${values})`
          }
          else {
            throw new TypeError(`Value for ${operator} must be an array`)
          }
          break

        case 'BETWEEN':
        case 'NOT BETWEEN':
          if (Array.isArray(value) && value.length === 2) {
            condition = `\`${String(field)}\` ${operator.toUpperCase()} '${value[0]}' AND '${value[1]}'`
          }
          else {
            throw new Error(`Value for ${operator} must be an array with two elements`)
          }
          break

        case 'IS NULL':
        case 'IS NOT NULL':
          condition = `\`${String(field)}\` ${operator.toUpperCase()}`
          break

        case 'LIKE':
        case 'NOT LIKE':
          condition = `\`${String(field)}\` ${operator.toUpperCase()} '${value}'`
          break

        default:
          condition = `\`${String(field)}\` ${operator} '${value}'`
      }
      params.conditions.push(`(${condition})`)
      return query
    },
    limit(limit: number) {
      params.limit = limit
      return query
    },
    select<K extends keyof Collections[T]>(...fields: K[]) {
      fields.length && params.selectedFields.push(...fields)
      return query
    },
    order(field: keyof Collections[T], direction: 'ASC' | 'DESC') {
      params.orderBy.push(`\`${String(field)}\` ${direction}`)
      return query
    },
    async all(): Promise<Collections[T][]> {
      return executeContentQuery<T, Collections[T]>(collection, buildQuery())
    },
    async first(): Promise<Collections[T]> {
      return executeContentQuery<T, Collections[T]>(collection, buildQuery()).then(res => res[0])
    },
  }

  function buildQuery() {
    let query = 'SELECT '
    query += params.selectedFields.length > 0 ? params.selectedFields.map(f => `\`${String(f)}\``).join(', ') : '*'
    query += ` FROM ${collection}`

    if (params.conditions.length > 0) {
      query += ` WHERE ${params.conditions.join(' AND ')}`
    }

    if (params.orderBy.length > 0) {
      query += ` ORDER BY ${params.orderBy.join(', ')}`
    }
    else {
      query += ` ORDER BY weight ASC, stem ASC`
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
