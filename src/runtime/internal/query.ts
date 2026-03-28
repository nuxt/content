import { withoutTrailingSlash } from 'ufo'
import type { Collections, CollectionQueryBuilder, CollectionQueryGroup, QueryGroupFunction, SQLOperator } from '@nuxt/content'
import manifestMeta, { tables } from '#content/manifest'

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

export const collectionQueryBuilder = <T extends keyof Collections>(collection: T, fetch: (collection: T, sql: string) => Promise<Collections[T][]>, detectedLocale?: string): CollectionQueryBuilder<Collections[T]> => {
  // Auto-detect i18n config from manifest for this collection
  const collectionMeta = (manifestMeta as Record<string, { i18n?: { locales: string[], defaultLocale: string } }>)[String(collection)]
  const i18nConfig = collectionMeta?.i18n
  // Track whether .locale() was called explicitly
  let localeExplicitlySet = false

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
      localeExplicitlySet = true
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
      applyAutoLocale()
      if (params.localeFallback) {
        return fetchWithLocaleFallback()
      }
      return fetch(collection, buildQuery()).then(res => (res || []) as Collections[T][])
    },
    async first(): Promise<Collections[T] | null> {
      applyAutoLocale()
      if (params.localeFallback) {
        return fetchWithLocaleFallback({ limit: 1 }).then(res => res[0] || null)
      }
      return fetch(collection, buildQuery({ limit: 1 })).then(res => res[0] || null)
    },
    async count(field: keyof Collections[T] | '*' = '*', distinct: boolean = false) {
      applyAutoLocale()
      if (params.localeFallback) {
        return fetchWithLocaleFallback().then(res => res.length)
      }
      return fetch(collection, buildQuery({
        count: { field: String(field), distinct },
      })).then(m => (m[0] as { count: number }).count)
    },
  }

  /**
   * Auto-apply locale filter when:
   * 1. The collection has i18n configured (in manifest)
   * 2. No explicit .locale() call was made
   * 3. A locale was detected from @nuxtjs/i18n
   * Runs once before query execution (all/first/count).
   */
  let autoLocaleApplied = false
  function applyAutoLocale() {
    if (autoLocaleApplied || localeExplicitlySet || !i18nConfig || !detectedLocale) return
    autoLocaleApplied = true
    if (detectedLocale === i18nConfig.defaultLocale) {
      // Default locale: single query, no fallback needed
      params.conditions.push(`("locale" = ${singleQuote(detectedLocale)})`)
    }
    else {
      // Non-default locale: query with fallback to default
      params.localeFallback = { locale: detectedLocale, fallback: i18nConfig.defaultLocale }
    }
  }

  async function fetchWithLocaleFallback(opts: { limit?: number } = {}): Promise<Collections[T][]> {
    const { locale, fallback } = params.localeFallback!

    // Sub-queries fetch ALL matching rows (no limit/offset) — we apply those JS-side on the merged result
    const localeCondition = `("locale" = ${singleQuote(locale)})`
    const localeQuery = buildQuery({ extraCondition: localeCondition, noLimitOffset: true })
    const localeResults = await fetch(collection, localeQuery).then(res => res || [])

    const fallbackCondition = `("locale" = ${singleQuote(fallback)})`
    const fallbackQuery = buildQuery({ extraCondition: fallbackCondition, noLimitOffset: true })
    const fallbackResults = await fetch(collection, fallbackQuery).then(res => res || [])

    // Merge: prefer locale results, fill gaps from fallback
    const getStem = (r: Collections[T]) => (r as unknown as { stem: string }).stem
    const localeStemSet = new Set(localeResults.map(getStem))
    const fallbackOnly = fallbackResults.filter(item => !localeStemSet.has(getStem(item)))

    // When using the default ORDER BY (stem ASC), we can do a proper sorted merge.
    // When a custom ORDER BY is specified, both sub-queries are already DB-sorted
    // by that field — we keep locale items first and append fallback items after,
    // preserving each group's DB order. A full interleave would require parsing
    // the SQL ORDER BY clause in JS, which is not feasible.
    const merged = params.orderBy.length === 0
      ? mergeSortedArrays(localeResults, fallbackOnly, getStem)
      : [...localeResults, ...fallbackOnly]

    // Apply offset then limit on the merged result
    let result = merged
    if (params.offset > 0) {
      result = result.slice(params.offset)
    }
    const limit = opts.limit ?? (params.limit > 0 ? params.limit : 0)
    if (limit > 0) {
      result = result.slice(0, limit)
    }

    return result as Collections[T][]
  }

  function buildQuery(opts: { count?: { field: string, distinct: boolean }, limit?: number, extraCondition?: string, noLimitOffset?: boolean } = {}) {
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

    // Skip ORDER BY for COUNT queries (PostgreSQL rejects ORDER BY on aggregate without GROUP BY)
    if (!opts?.count) {
      if (params.orderBy.length > 0) {
        query += ` ORDER BY ${params.orderBy.join(', ')}`
      }
      else {
        query += ` ORDER BY stem ASC`
      }
    }

    const limit = opts?.limit || params.limit
    if (!opts?.noLimitOffset && limit > 0) {
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

/**
 * Merge two arrays that are already sorted by the same criteria (from DB ORDER BY).
 * Uses the `stem` field as tie-breaker key to interleave items in the correct position.
 * This preserves any ORDER BY the DB applied (date DESC, custom fields, etc.).
 */
function mergeSortedArrays<T>(a: T[], b: T[], getStem: (r: T) => string): T[] {
  // Both arrays come from the DB with the same ORDER BY.
  // Build a position map from array `a` stems to interleave `b` items correctly.
  // Items in `b` whose stem falls between two `a` items get inserted at that position.
  const result: T[] = []
  let ai = 0
  let bi = 0
  while (ai < a.length && bi < b.length) {
    if (getStem(a[ai]!).localeCompare(getStem(b[bi]!)) <= 0) {
      result.push(a[ai]!)
      ai++
    }
    else {
      result.push(b[bi]!)
      bi++
    }
  }
  while (ai < a.length) {
    result.push(a[ai]!)
    ai++
  }
  while (bi < b.length) {
    result.push(b[bi]!)
    bi++
  }
  return result
}

function singleQuote(value: unknown) {
  return `'${String(value).replace(/'/g, '\'\'')}'`
}
