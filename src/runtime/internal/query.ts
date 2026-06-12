import { withoutTrailingSlash } from 'ufo'
import type { Collections, CollectionI18nConfig, CollectionQueryBuilder, CollectionQueryGroup, ManifestCollectionsMeta, QueryGroupFunction, SQLOperator } from '@nuxt/content'
import manifestMeta, { tables } from '#content/manifest'

/**
 * Read the raw conditions accumulated on a group built by `collectionQueryGroup`.
 * Exposed so other modules can serialize a group (for example to build a cache key)
 * without reaching into the internal `_conditions` field via a cast.
 */
export const getGroupConditions = <T extends keyof Collections>(group: CollectionQueryGroup<Collections[T]>): string[] => {
  return (group as unknown as { _conditions: Array<string> })._conditions
}

export const buildGroup = <T extends keyof Collections>(group: CollectionQueryGroup<Collections[T]>, type: 'AND' | 'OR'): string => {
  const conditions = getGroupConditions(group)
  return conditions.length > 0 ? `(${conditions.join(` ${type} `)})` : ''
}

/**
 * Match any condition that filters on the `locale` column, regardless of operator,
 * value, or nesting depth. Used to detect manual locale filters so auto-locale
 * steps aside.
 *
 * The quoted column token `"locale"` is detected anywhere in a condition (so a
 * filter nested inside an `andWhere`/`orWhere` group still counts), after string
 * literals are stripped so a value that happens to contain the text `"locale"`
 * does not produce a false match. Column references are always double-quoted while
 * values are single-quoted, so the two never collide.
 */
export const referencesLocaleColumn = (conditions: string[]): boolean =>
  conditions.some(c => stripSingleQuoted(c).includes('"locale"'))

/** Remove single-quoted string literals, honouring doubled-quote (`''`) escapes. */
const stripSingleQuoted = (condition: string): string =>
  condition.replace(/'(?:[^']|'')*'/g, '')

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
  // Read collection metadata from the manifest through the shared typed view so the
  // property shape stays in sync with `templates.ts`.
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
    count: {
      field: '' as keyof Collections[T] | '*',
      distinct: false,
    },
    // Locale fallback runs as two queries merged in JS (see `fetchWithLocaleFallback`).
    localeFallback: undefined as { locale: string, fallback: string } | undefined,
    // Tracks whether `.locale()` was called explicitly. Surfaced to the cache key.
    localeExplicitlySet: false,
  }

  const query: CollectionQueryBuilder<Collections[T]> = {
    // @ts-expect-error -- internal
    __params: params,
    andWhere(groupFactory: QueryGroupFunction<Collections[T]>) {
      const group = groupFactory(collectionQueryGroup(collection))
      // A manual filter on `locale` (in any nested condition) suppresses auto-locale
      // so the two cannot combine into a contradictory WHERE clause.
      if (referencesLocaleColumn(getGroupConditions(group))) {
        params.localeExplicitlySet = true
      }
      params.conditions.push(buildGroup(group, 'AND'))
      return query
    },
    orWhere(groupFactory: QueryGroupFunction<Collections[T]>) {
      const group = groupFactory(collectionQueryGroup(collection))
      if (referencesLocaleColumn(getGroupConditions(group))) {
        params.localeExplicitlySet = true
      }
      params.conditions.push(buildGroup(group, 'OR'))
      return query
    },
    path(path: string) {
      return query.where('path', '=', withoutTrailingSlash(path))
    },
    stem(stem: string) {
      // Strip leading and trailing slashes so callers can pass either form. The stored
      // `stem` column never contains them, and `stemPrefix` is normalized at template
      // generation time (see `templates.ts`).
      const normalized = stem.replace(/^\/+|\/+$/g, '')
      // Prepend the collection's source prefix when the input does not already include
      // it. The segment boundary check (`stemPrefix + '/'`) avoids false matches such
      // as prefix `navigation` matching `navigation2/foo`.
      const fullStem = stemPrefix && !(normalized === stemPrefix || normalized.startsWith(stemPrefix + '/'))
        ? `${stemPrefix}/${normalized}`
        : normalized
      return query.where('stem', '=', fullStem)
    },
    locale(locale: string, opts?: { fallback?: string }) {
      // Dev-only guard. Calling `.locale()` on a collection without `i18n` would emit
      // `WHERE "locale" = ?` against a table that has no `locale` column, surfacing
      // as a confusing "no such column" SQL error far from the user's call site.
      // The manifest is the source of truth, so `i18nConfig` is undefined exactly
      // when the collection was not declared with `i18n`.
      if (import.meta.dev && !i18nConfig) {
        console.warn(
          `[@nuxt/content] queryCollection("${String(collection)}").locale(${JSON.stringify(locale)}): `
          + `collection "${String(collection)}" has no \`i18n\` configured. The query will fail at the database. `
          + 'Add `i18n: true` (or an explicit `i18n: { locales, defaultLocale }`) to the collection definition.',
        )
      }
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
        // Compute the effective field list via overrides rather than mutating `params`.
        // Mutation would race under `Promise.all([qb.all(), qb.count()])`.
        const countField = field !== '*' ? String(field) : undefined
        const fieldsOverride = countField
          && params.selectedFields.length > 0
          && !params.selectedFields.includes(field as keyof Collections[T])
          ? [...params.selectedFields, field as keyof Collections[T]]
          : undefined

        // `bypassPagination` counts the full match set rather than the visible page,
        // so `.limit(5).count()` returns the total rather than 5.
        const res = await fetchWithLocaleFallback({
          preserveField: countField,
          autoLocale,
          fieldsOverride,
          bypassPagination: true,
        })
        if (field === '*') return res.length
        const values = res
          .map(r => (r as unknown as Record<string, unknown>)[String(field)])
          .filter(v => v !== null && v !== undefined)
        if (!distinct) return values.length
        // Mirror SQL `COUNT(DISTINCT ...)`, which compares serialized values. Key
        // the set on a stable serialization so structurally-equal JSON/object
        // column values collapse rather than counting as distinct references.
        const keys = values.map(v => (typeof v === 'object' ? JSON.stringify(v) : v))
        return new Set(keys).size
      }
      // `noLimitOffset` is essential here. A COUNT query returns exactly one row,
      // so any `LIMIT`/`OFFSET` carried over from `.skip()`/`.limit()` either caps
      // a single-row result (harmless but misleading) or, when offset is positive,
      // slices past it and yields `[]`, making `m[0].count` throw a TypeError.
      return fetch(collection, buildQuery({
        count: { field: String(field), distinct },
        autoLocale,
        noLimitOffset: true,
      })).then(m => (m[0] as { count: number }).count)
    },
  }

  /**
   * Compute the auto-locale effect for this execution **without mutating** persistent
   * state. Safe for builder reuse, since each terminal method re-resolves against
   * the current `params`.
   *
   * Returns:
   * - `condition`, an extra WHERE fragment to append when the default locale is
   *   detected (single-query path), or undefined.
   * - `fallback`, a `{ locale, fallback }` pair when a non-default locale is
   *   detected and no explicit `.locale()` was set, or undefined.
   *
   * Returns an empty object when the collection has no i18n config, no locale was
   * detected, the detected locale is not in the configured list, or the user
   * already called `.locale()`.
   */
  function resolveAutoLocale(): { condition?: string, fallback?: { locale: string, fallback: string } } {
    if (params.localeExplicitlySet || !i18nConfig || !detectedLocale) return {}
    if (!i18nConfig.locales.includes(detectedLocale)) {
      // BCP-47 tag mismatch (for example, `@nuxtjs/i18n` returns `en-US` for a
      // collection declaring only `en`). Silently skipping auto-locale here would
      // yield rows from every locale, which is rarely what the user expects.
      // Surfacing the mismatch at the call site prevents confusing downstream
      // symptoms such as a French page rendering English content.
      if (import.meta.dev) {
        console.warn(
          `[@nuxt/content] queryCollection("${String(collection)}"): detected locale `
          + `"${detectedLocale}" is not in this collection's locales `
          + `[${i18nConfig.locales.map(l => `"${l}"`).join(', ')}]. Auto-locale filter skipped, `
          + 'so the query will return rows from every locale. If you use BCP-47 tags '
          + 'like "en-US", either declare them in the collection\'s `i18n.locales` or '
          + 'strip the region subtag before passing it to @nuxtjs/i18n.',
        )
      }
      return {}
    }
    if (detectedLocale === i18nConfig.defaultLocale) {
      return { condition: `("locale" = ${singleQuote(detectedLocale)})` }
    }
    return { fallback: { locale: detectedLocale, fallback: i18nConfig.defaultLocale } }
  }

  /**
   * Two-query locale fallback. Fetches locale-specific rows and default-locale rows,
   * then merges by stem so that locale items take priority and fallback items fill
   * any gaps. The `stem` column is injected into the SELECT list for merge-key
   * deduplication, then stripped from results when the caller did not select it.
   *
   * All effective state is passed by argument, so this function never mutates
   * `params`. That keeps the builder safe to reuse across concurrent calls such as
   * `Promise.all([qb.all(), qb.count()])`. An earlier mutate-and-restore approach
   * leaked partial state across the race window between concurrent terminals.
   *
   * When called from the auto-locale path, `params.localeFallback` may be undefined
   * and the fallback pair instead comes from `autoLocale.fallback`.
   */
  async function fetchWithLocaleFallback(opts: {
    limit?: number
    preserveField?: string
    autoLocale?: { condition?: string, fallback?: { locale: string, fallback: string } }
    /** Override `params.selectedFields` for this call (used by `.count()` to add the counted field). */
    fieldsOverride?: Array<keyof Collections[T]>
    /** Ignore `params.offset` and `params.limit` (used by `.count()` so paging does not truncate the count). */
    bypassPagination?: boolean
  } = {}): Promise<Collections[T][]> {
    // Callers gate on `params.localeFallback || opts.autoLocale?.fallback` being
    // truthy, so one of them is always defined here. The `||` collapses both branches.
    const fb = (params.localeFallback || opts.autoLocale?.fallback) as { locale: string, fallback: string }
    const { locale, fallback } = fb

    // Inject `stem` into the SELECT list so it is available as the merge key. A
    // local flag records the injection so the column can be stripped from results
    // when the caller did not ask for it.
    const baseFields = opts.fieldsOverride ?? params.selectedFields
    const stemInjected = baseFields.length > 0 && !baseFields.includes('stem' as keyof Collections[T])
    const fieldsForQuery = stemInjected
      ? [...baseFields, 'stem' as keyof Collections[T]]
      : baseFields

    // Sub-queries fetch every matching row (no limit, no offset). Pagination is
    // applied JS-side on the merged result. The auto-locale `condition` is
    // intentionally not propagated here, since each sub-query already pins its own
    // locale via `extraCondition` and a second condition would double-filter.
    //
    // The two queries are independent and issued in parallel via `Promise.all`,
    // which halves perceived latency on the non-default-locale path and short
    // circuits on the first rejection (the desired behaviour, since the merge
    // cannot proceed without both result sets).
    const localeQuery = buildQuery({
      extraCondition: `("locale" = ${singleQuote(locale)})`,
      noLimitOffset: true,
      selectedFields: fieldsForQuery,
    })
    const fallbackQuery = buildQuery({
      extraCondition: `("locale" = ${singleQuote(fallback)})`,
      noLimitOffset: true,
      selectedFields: fieldsForQuery,
    })
    const [localeResults, fallbackResults] = await Promise.all([
      fetch(collection, localeQuery).then(res => res || []),
      fetch(collection, fallbackQuery).then(res => res || []),
    ])

    // Prefer locale results, fall back to default-locale rows for any missing stems.
    const getStem = (r: Collections[T]) => (r as unknown as { stem: string }).stem
    const localeStemSet = new Set(localeResults.map(getStem))
    const fallbackOnly = fallbackResults.filter(item => !localeStemSet.has(getStem(item)))

    // Under the default `ORDER BY stem ASC` the two result sets are re-interleaved
    // by stem so the merged page matches a single-query ordering. The navigation
    // and surround helpers inject `order('stem', 'ASC')` (serialized as
    // `"stem" ASC`) when no explicit order is set, so that case takes the sorted
    // path too. Sorting happens in JS rather than relying on the database returning
    // rows in binary order, which keeps the result deterministic on backends whose
    // default collation is not binary (for example PostgreSQL with a linguistic
    // locale). A custom `.order()` cannot be reproduced here without parsing the
    // SQL ORDER BY clause, so that path concatenates locale items first, then
    // fallback items, each group retaining its database order.
    const isDefaultStemOrder = params.orderBy.length === 0
      || (params.orderBy.length === 1 && params.orderBy[0] === '"stem" ASC')
    const combined = [...localeResults, ...fallbackOnly]
    const merged = isDefaultStemOrder
      ? combined.sort((a, b) => {
          const sa = getStem(a)
          const sb = getStem(b)
          return sa < sb ? -1 : sa > sb ? 1 : 0
        })
      : combined

    // Apply offset then limit on the merged result.
    let result = merged
    if (!opts.bypassPagination) {
      if (params.offset > 0) {
        result = result.slice(params.offset)
      }
      const limit = opts.limit ?? (params.limit > 0 ? params.limit : 0)
      if (limit > 0) {
        result = result.slice(0, limit)
      }
    }

    // Strip the internally injected `stem` column when the caller did not select it,
    // unless a `.count()` call is targeting that field via `preserveField`.
    if (stemInjected && opts.preserveField !== 'stem') {
      return result.map((item) => {
        const { stem: _, ...rest } = item as unknown as Record<string, unknown>
        return rest as Collections[T]
      })
    }

    return result as Collections[T][]
  }

  function buildQuery(opts: {
    count?: { field: string, distinct: boolean }
    limit?: number
    extraCondition?: string
    noLimitOffset?: boolean
    autoLocale?: { condition?: string, fallback?: { locale: string, fallback: string } }
    /** Override the SELECT field list without mutating `params.selectedFields`. */
    selectedFields?: ReadonlyArray<keyof Collections[T]>
  } = {}) {
    let query = 'SELECT '
    if (opts?.count) {
      const countField = opts.count.field === '*' ? '*' : `"${opts.count.field.replace(/"/g, '')}"`
      query += `COUNT(${opts.count.distinct ? 'DISTINCT ' : ''}${countField}) as count`
    }
    else {
      const fields = Array.from(new Set(opts.selectedFields ?? params.selectedFields))
      query += fields.length > 0 ? fields.map(f => `"${String(f)}"`).join(', ') : '*'
    }
    query += ` FROM ${tables[String(collection)]}`

    const conditions = [...params.conditions]
    // Auto-locale condition for the single-query path. The fallback path is handled
    // by `fetchWithLocaleFallback` and passes `extraCondition` instead. When
    // `extraCondition` is set, the caller is a fallback sub-query that already pins
    // its own locale, so the auto-locale condition is skipped to avoid double-filtering.
    if (opts.autoLocale?.condition && !opts.extraCondition) {
      conditions.push(opts.autoLocale.condition)
    }
    if (opts.extraCondition) {
      conditions.push(opts.extraCondition)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    // Skip ORDER BY on COUNT queries since PostgreSQL rejects ORDER BY on an
    // aggregate without a GROUP BY clause.
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

function singleQuote(value: unknown) {
  return `'${String(value).replace(/'/g, '\'\'')}'`
}
