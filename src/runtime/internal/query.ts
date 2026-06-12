import { withoutTrailingSlash } from 'ufo'
import type { Collections, CollectionI18nConfig, CollectionQueryBuilder, CollectionQueryGroup, ManifestCollectionsMeta, QueryGroupFunction, SQLOperator } from '@nuxt/content'
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
  // Read collection metadata from manifest. Cast through the shared typed view
  // so the property shape stays in sync with templates.ts.
  const collectionMeta: ManifestCollectionsMeta[string] | undefined
    = (manifestMeta as ManifestCollectionsMeta)[String(collection)]
  const i18nConfig: CollectionI18nConfig | undefined = collectionMeta?.i18n
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
      const autoLocale = resolveAutoLocale()
      if (params.localeFallback || autoLocale.fallback) {
        return fetchWithLocaleFallback({ autoLocale })
      }
      return fetch(collection, buildQuery({ autoLocale })).then(res => (res || []) as Collections[T][])
    },
    async first(): Promise<Collections[T] | null> {
      const autoLocale = resolveAutoLocale()
      if (params.localeFallback || autoLocale.fallback) {
        return fetchWithLocaleFallback({ limit: 1, autoLocale }).then(res => res[0] || null)
      }
      return fetch(collection, buildQuery({ limit: 1, autoLocale })).then(res => res[0] || null)
    },
    async count(field: keyof Collections[T] | '*' = '*', distinct: boolean = false) {
      const autoLocale = resolveAutoLocale()
      if (params.localeFallback || autoLocale.fallback) {
        // Ensure the counted field is fetched and bypass pagination for accurate counts.
        // Save/restore in finally so an error in fetch doesn't leak state to later calls.
        const countField = field !== '*' ? String(field) : undefined
        const savedFields = params.selectedFields
        const savedOffset = params.offset
        const savedLimit = params.limit
        if (countField && savedFields.length > 0 && !savedFields.includes(field as keyof Collections[T])) {
          params.selectedFields = [...savedFields, field as keyof Collections[T]]
        }
        params.offset = 0
        params.limit = 0
        try {
          const res = await fetchWithLocaleFallback({ preserveField: countField, autoLocale })
          if (field === '*') return res.length
          const values = res
            .map(r => (r as unknown as Record<string, unknown>)[String(field)])
            .filter(v => v !== null && v !== undefined)
          return distinct ? new Set(values).size : values.length
        }
        finally {
          params.selectedFields = savedFields
          params.offset = savedOffset
          params.limit = savedLimit
        }
      }
      return fetch(collection, buildQuery({
        count: { field: String(field), distinct },
        autoLocale,
      })).then(m => (m[0] as { count: number }).count)
    },
  }

  /**
   * Compute the auto-locale effect for this execution **without mutating** persistent state.
   * Safe for builder reuse: each terminal method re-resolves based on current params.
   *
   * Returns:
   * - `condition`: an extra WHERE fragment to append when the default locale is detected
   *   (single-query path), or undefined.
   * - `fallback`: a `{ locale, fallback }` pair when a non-default locale is detected and no
   *   explicit `.locale()` was set, or undefined.
   *
   * Skips entirely when the collection has no i18n config, no locale was detected,
   * the detected locale isn't in the configured list, or the user already called `.locale()`.
   */
  function resolveAutoLocale(): { condition?: string, fallback?: { locale: string, fallback: string } } {
    if (params.localeExplicitlySet || !i18nConfig || !detectedLocale) return {}
    if (!i18nConfig.locales.includes(detectedLocale)) return {}
    if (detectedLocale === i18nConfig.defaultLocale) {
      return { condition: `("locale" = ${singleQuote(detectedLocale)})` }
    }
    return { fallback: { locale: detectedLocale, fallback: i18nConfig.defaultLocale } }
  }

  /**
   * Two-query locale fallback: fetches locale-specific rows and default-locale rows,
   * then merges by stem (locale items take priority, fallback fills gaps).
   * Internally injects 'stem' into selectedFields for merge-key deduplication,
   * stripping it from results when the caller didn't explicitly select it.
   * Accepts an optional limit override and a preserveField to keep for count operations.
   *
   * Note: when called from auto-locale path, params.localeFallback may be undefined
   * and the fallback target comes from autoLocale.fallback instead.
   */
  async function fetchWithLocaleFallback(opts: {
    limit?: number
    preserveField?: string
    autoLocale?: { condition?: string, fallback?: { locale: string, fallback: string } }
  } = {}): Promise<Collections[T][]> {
    const fb = params.localeFallback || opts.autoLocale?.fallback!
    const { locale, fallback } = fb

    // Ensure `stem` is always fetched — needed for merge-key deduplication.
    // Track whether we injected it so we can strip it from results later.
    const savedFields = params.selectedFields
    const stemInjected = savedFields.length > 0 && !savedFields.includes('stem' as keyof Collections[T])
    if (stemInjected) {
      params.selectedFields = [...savedFields, 'stem' as keyof Collections[T]]
    }

    try {
      // Sub-queries fetch ALL matching rows (no limit/offset) — we apply those JS-side on the merged result.
      // Auto-locale's `condition` is intentionally NOT applied to sub-queries: we are overriding the locale
      // here, so passing the original autoLocale would double-filter.
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
    finally {
      // Restore original selectedFields even on fetch errors so later calls aren't poisoned
      params.selectedFields = savedFields
    }
  }

  function buildQuery(opts: {
    count?: { field: string, distinct: boolean }
    limit?: number
    extraCondition?: string
    noLimitOffset?: boolean
    autoLocale?: { condition?: string, fallback?: { locale: string, fallback: string } }
  } = {}) {
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
    // Auto-locale condition (single-query path — fallback path handled in fetchWithLocaleFallback).
    // Skip when extraCondition is set: that's the fallback sub-query which already pins its own locale.
    if (opts.autoLocale?.condition && !opts.extraCondition) {
      conditions.push(opts.autoLocale.condition)
    }
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
 * Interleaves items using **binary comparison** of their `stem` values to match
 * SQLite's default BINARY collation (and PostgreSQL's "C" ordering of ASCII codepoints).
 *
 * We deliberately do NOT use `localeCompare`: that uses Unicode collation which
 * orders `'a' < 'A'` (case-insensitive linguistic order), whereas the DB sorts
 * `'A' (65) < 'a' (97)` (codepoint order). Using `localeCompare` would interleave
 * the two result sets in a different order than the DB returned them.
 *
 * Precondition: both arrays must be sorted by stem ASC — this function does NOT
 * handle arbitrary ORDER BY clauses (use concatenation for custom sorts).
 */
function mergeSortedArrays<T>(a: T[], b: T[], getStem: (r: T) => string): T[] {
  const result: T[] = []
  let ai = 0
  let bi = 0
  while (ai < a.length && bi < b.length) {
    // Plain `<=` matches SQL BINARY/codepoint order; equal stems can't both occur
    // here (we filter duplicates in the caller), but `<=` keeps `a` stable on ties.
    if (getStem(a[ai]!) <= getStem(b[bi]!)) {
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
