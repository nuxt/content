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
  // Read collection metadata from manifest
  const collectionMeta = (manifestMeta as Record<string, { i18n?: { locales: string[], defaultLocale: string }, stemPrefix?: string }>)[String(collection)]
  const i18nConfig = collectionMeta?.i18n
  const stemPrefix = collectionMeta?.stemPrefix || ''
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
    // Track whether .locale() was called explicitly (exposed for cache key generation)
    localeExplicitlySet: false,
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
    stem(stem: string) {
      // Resolve full stem by prepending the collection's source prefix if not already present.
      // Check segment boundary to avoid false matches (e.g. prefix "navigation" matching "navigation2/foo").
      const fullStem = stemPrefix && !(stem === stemPrefix || stem.startsWith(stemPrefix + '/'))
        ? `${stemPrefix}/${stem}`
        : stem
      return query.where('stem', '=', fullStem)
    },
    locale(locale: string, opts?: { fallback?: string }) {
      params.localeExplicitlySet = true
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
        // Ensure the counted field is fetched and bypass pagination for accurate counts
        const countField = field !== '*' ? String(field) : undefined
        const savedFields = params.selectedFields
        const savedOffset = params.offset
        const savedLimit = params.limit
        if (countField && savedFields.length > 0 && !savedFields.includes(field as keyof Collections[T])) {
          params.selectedFields = [...savedFields, field as keyof Collections[T]]
        }
        params.offset = 0
        params.limit = 0
        return fetchWithLocaleFallback({ preserveField: countField }).then((res) => {
          params.selectedFields = savedFields
          params.offset = savedOffset
          params.limit = savedLimit
          if (field === '*') return res.length
          const values = res
            .map(r => (r as unknown as Record<string, unknown>)[String(field)])
            .filter(v => v !== null && v !== undefined)
          return distinct ? new Set(values).size : values.length
        })
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
    if (autoLocaleApplied || params.localeExplicitlySet || !i18nConfig || !detectedLocale) return
    if (!i18nConfig.locales.includes(detectedLocale)) return
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

  /**
   * Two-query locale fallback: fetches locale-specific rows and default-locale rows,
   * then merges by stem (locale items take priority, fallback fills gaps).
   * Internally injects 'stem' into selectedFields for merge-key deduplication,
   * stripping it from results when the caller didn't explicitly select it.
   * Accepts an optional limit override and a preserveField to keep for count operations.
   */
  async function fetchWithLocaleFallback(opts: { limit?: number, preserveField?: string } = {}): Promise<Collections[T][]> {
    const { locale, fallback } = params.localeFallback!

    // Ensure `stem` is always fetched — needed for merge-key deduplication.
    // Track whether we injected it so we can strip it from results later.
    const savedFields = params.selectedFields
    const stemInjected = savedFields.length > 0 && !savedFields.includes('stem' as keyof Collections[T])
    if (stemInjected) {
      params.selectedFields = [...savedFields, 'stem' as keyof Collections[T]]
    }

    // Sub-queries fetch ALL matching rows (no limit/offset) — we apply those JS-side on the merged result
    const localeCondition = `("locale" = ${singleQuote(locale)})`
    const localeQuery = buildQuery({ extraCondition: localeCondition, noLimitOffset: true })
    const localeResults = await fetch(collection, localeQuery).then(res => res || [])

    const fallbackCondition = `("locale" = ${singleQuote(fallback)})`
    const fallbackQuery = buildQuery({ extraCondition: fallbackCondition, noLimitOffset: true })
    const fallbackResults = await fetch(collection, fallbackQuery).then(res => res || [])

    // Restore original selectedFields to avoid side-effects on repeated calls
    params.selectedFields = savedFields

    // Merge: prefer locale results, fill gaps from fallback
    const getStem = (r: Collections[T]) => (r as unknown as { stem: string }).stem
    const localeStemSet = new Set(localeResults.map(getStem))
    const fallbackOnly = fallbackResults.filter(item => !localeStemSet.has(getStem(item)))

    // When using the default ORDER BY (stem ASC), we can do a proper sorted merge
    // because mergeSortedArrays compares by stem.
    // LIMITATION: when a custom ORDER BY is specified, we cannot interleave the
    // two result sets correctly because that would require parsing the SQL ORDER BY
    // clause and re-implementing the comparison in JS. Instead we concatenate
    // locale items first, then fallback items — each group retains its DB order
    // but the overall sequence may not match a single-query ORDER BY.
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

    // Strip internally-injected 'stem' if the caller didn't select it
    // (unless it's needed by a count() call targeting that field)
    if (stemInjected && opts.preserveField !== 'stem') {
      return result.map((item) => {
        const { stem: _, ...rest } = item as unknown as Record<string, unknown>
        return rest as Collections[T]
      })
    }

    return result as Collections[T][]
  }

  function buildQuery(opts: { count?: { field: string, distinct: boolean }, limit?: number, extraCondition?: string, noLimitOffset?: boolean } = {}) {
    let query = 'SELECT '
    if (opts?.count) {
      const countField = opts.count.field === '*' ? '*' : `"${opts.count.field.replace(/"/g, '')}"`
      query += `COUNT(${opts.count.distinct ? 'DISTINCT ' : ''}${countField}) as count`
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
 * Merge two arrays that are both sorted by `stem` ASC (the default ORDER BY).
 * Interleaves items using lexicographic comparison of their `stem` values.
 * Precondition: both arrays must be sorted by stem ASC — this function does NOT
 * handle arbitrary ORDER BY clauses (use concatenation for custom sorts).
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
