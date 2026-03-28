import { withoutTrailingSlash } from 'ufo'
import type { Collections, CollectionQueryBuilder, CollectionQueryGroup, QueryGroupFunction, SQLOperator } from '@nuxt/content'
import { tables } from '#content/manifest'

const buildGroup = <T extends keyof Collections>(group: CollectionQueryGroup<Collections[T]>, type: 'AND' | 'OR') => {
  const conditions = (group as unknown as { _conditions: Array<string> })._conditions
  return conditions.length > 0 ? `(${conditions.join(` ${type} `)})` : ''
}

export const collectionQueryGroup = <T extends keyof Collections>(collection: T): CollectionQueryGroup<Collections[T]> => {
  const conditions = [] as Array<string>

  const query: CollectionQueryGroup<Collections[T]> = {
    // @ts-expect-error -- internal
    _conditions: conditions,
    where(field: keyof Collections[T] | string, operator: SQLOperator, value?: unknown): CollectionQueryGroup<Collections[T]> {
      let condition: string

      switch (operator.toUpperCase()) {
        case 'IN':
        case 'NOT IN':
          if (Array.isArray(value)) {
            const values = value.map(val => singleQuote(val)).join(', ')
            condition = `"${String(field)}" ${operator.toUpperCase()} (${values})`
          }
          else {
            throw new TypeError(`Value for ${operator} must be an array`)
          }
          break

        case 'BETWEEN':
        case 'NOT BETWEEN':
          if (Array.isArray(value) && value.length === 2) {
            condition = `"${String(field)}" ${operator.toUpperCase()} ${singleQuote(value[0])} AND ${singleQuote(value[1])}`
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
          condition = `"${String(field)}" ${operator.toUpperCase()} ${singleQuote(value)}`
          break

        default:
          condition = `"${String(field)}" ${operator} ${singleQuote(typeof value === 'boolean' ? Number(value) : value)}`
      }
      conditions.push(`${condition}`)
      return query
    },
    andWhere(groupFactory: QueryGroupFunction<Collections[T]>) {
      const group = groupFactory(collectionQueryGroup(collection))
      conditions.push(buildGroup(group, 'AND'))
      return query
    },
    orWhere(groupFactory: QueryGroupFunction<Collections[T]>) {
      const group = groupFactory(collectionQueryGroup(collection))
      conditions.push(buildGroup(group, 'OR'))
      return query
    },
  }

  return query
}

export const collectionQueryBuilder = <T extends keyof Collections>(collection: T, fetch: (collection: T, sql: string) => Promise<Collections[T][]>): CollectionQueryBuilder<Collections[T]> => {
  const params = {
    conditions: [] as Array<string>,
    selectedFields: [] as Array<keyof Collections[T]>,
    offset: 0,
    limit: 0,
    orderBy: [] as Array<string>,
    // Count query
    count: {
      field: '' as keyof Collections[T] | '*',
      distinct: false,
    },
    // Locale fallback (handled via two queries + JS merge)
    localeFallback: undefined as { locale: string, fallback: string } | undefined,
  }

  const query: CollectionQueryBuilder<Collections[T]> = {
    // @ts-expect-error -- internal
    __params: params,
    andWhere(groupFactory: QueryGroupFunction<Collections[T]>) {
      const group = groupFactory(collectionQueryGroup(collection))
      params.conditions.push(buildGroup(group, 'AND'))
      return query
    },
    orWhere(groupFactory: QueryGroupFunction<Collections[T]>) {
      const group = groupFactory(collectionQueryGroup(collection))
      params.conditions.push(buildGroup(group, 'OR'))
      return query
    },
    path(path: string) {
      return query.where('path', '=', withoutTrailingSlash(path))
    },
    locale(locale: string, opts?: { fallback?: string }) {
      if (opts?.fallback) {
        params.localeFallback = { locale, fallback: opts.fallback }
      }
      else {
        query.where('locale', '=', locale)
      }
      return query
    },
    skip(skip: number) {
      params.offset = skip
      return query
    },
    where(field: keyof Collections[T] | string, operator: SQLOperator, value?: unknown): CollectionQueryBuilder<Collections[T]> {
      query.andWhere(group => group.where(String(field), operator, value))
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
      if (params.localeFallback) {
        return fetchWithLocaleFallback()
      }
      return fetch(collection, buildQuery()).then(res => (res || []) as Collections[T][])
    },
    async first(): Promise<Collections[T] | null> {
      if (params.localeFallback) {
        return fetchWithLocaleFallback({ limit: 1 }).then(res => res[0] || null)
      }
      return fetch(collection, buildQuery({ limit: 1 })).then(res => res[0] || null)
    },
    async count(field: keyof Collections[T] | '*' = '*', distinct: boolean = false) {
      return fetch(collection, buildQuery({
        count: { field: String(field), distinct },
      })).then(m => (m[0] as { count: number }).count)
    },
  }

  async function fetchWithLocaleFallback(opts: { limit?: number } = {}): Promise<Collections[T][]> {
    const { locale, fallback } = params.localeFallback!

    // Query for the requested locale
    const localeCondition = `("locale" = ${singleQuote(locale)})`
    const localeQuery = buildQuery({ extraCondition: localeCondition })
    const localeResults = await fetch(collection, localeQuery).then(res => res || [])

    // Query for the fallback locale
    const fallbackCondition = `("locale" = ${singleQuote(fallback)})`
    const fallbackQuery = buildQuery({ extraCondition: fallbackCondition })
    const fallbackResults = await fetch(collection, fallbackQuery).then(res => res || [])

    // Merge: prefer locale results, fill gaps from fallback by stem
    const stemSet = new Set(localeResults.map((r: Collections[T]) => (r as unknown as { stem: string }).stem))
    const merged = [...localeResults]
    for (const item of fallbackResults) {
      if (!stemSet.has((item as unknown as { stem: string }).stem)) {
        merged.push(item)
      }
    }

    // Apply limit if specified
    if (opts.limit && opts.limit > 0) {
      return merged.slice(0, opts.limit) as Collections[T][]
    }

    return merged as Collections[T][]
  }

  function buildQuery(opts: { count?: { field: string, distinct: boolean }, limit?: number, extraCondition?: string } = {}) {
    let query = 'SELECT '
    if (opts?.count) {
      query += `COUNT(${opts.count.distinct ? 'DISTINCT ' : ''}${opts.count.field}) as count`
    }
    else {
      const fields = Array.from(new Set(params.selectedFields))
      query += fields.length > 0 ? fields.map(f => `"${String(f)}"`).join(', ') : '*'
    }
    query += ` FROM ${tables[String(collection)]}`

    const conditions = [...params.conditions]
    if (opts.extraCondition) {
      conditions.push(opts.extraCondition)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    if (params.orderBy.length > 0) {
      query += ` ORDER BY ${params.orderBy.join(', ')}`
    }
    else {
      query += ` ORDER BY stem ASC`
    }

    const limit = opts?.limit || params.limit
    if (limit > 0) {
      if (params.offset > 0) {
        query += ` LIMIT ${limit} OFFSET ${params.offset}`
      }
      else {
        query += ` LIMIT ${limit}`
      }
    }

    return query
  }

  return query
}

function singleQuote(value: unknown) {
  return `'${String(value).replace(/'/g, '\'\'')}'`
}
