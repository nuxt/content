import { withoutTrailingSlash } from 'ufo'
import type { Collections, CollectionI18nConfig, CollectionQueryBuilder, CollectionQueryGroup, QueryGroupFunction, SQLOperator } from '@nuxt/content'
import manifestMeta, { tables } from '#content/manifest'

const getGroupConditions = <T extends keyof Collections>(group: CollectionQueryGroup<Collections[T]>): string[] => {
  return (group as unknown as { _conditions: Array<string> })._conditions
}

const buildGroup = <T extends keyof Collections>(group: CollectionQueryGroup<Collections[T]>, type: 'AND' | 'OR') => {
  const conditions = getGroupConditions(group)
  return conditions.length > 0 ? `(${conditions.join(` ${type} `)})` : ''
}

/**
 * Whether any condition filters on the `locale` column, at any nesting depth.
 * String literals are stripped first so a value containing the text `"locale"`
 * does not match. Column names are always double-quoted and values single-quoted.
 */
const referencesLocaleColumn = (conditions: string[]): boolean =>
  conditions.some(c => c.replace(/'(?:[^']|'')*'/g, '').includes('"locale"'))

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

type Row = Record<string, unknown>
type LocaleFallback = { locale: string, fallback: string }

/** Columns a fallback lookup reads to decide which locale serves each stem. */
const LOCALE_KEY_FIELDS = ['id', 'stem', 'locale']

/** Key rows in the first window of a paged fallback lookup. Smaller results fit in one window. */
const KEY_WINDOW_SIZE = 256

/** One slice of a paged fallback lookup. */
interface KeyWindow {
  offset: number
  limit: number
  /** Builder state captured when the terminal method was called. */
  conditions: string[]
  orderBy: string[]
  /** Stems known to have a row in the requested locale, shared by the windows of one lookup. */
  translated: Set<unknown>
}

/** `<collection>:<locale>` pairs already reported as outside the collection locales. */
const unknownLocaleWarnings = new Set<string>()

/**
 * UTF-8 bytes of values per `IN (...)` list. Statements stay well below the
 * 100,000 limit of the server endpoint (`MAX_SQL_QUERY_LENGTH`) and Cloudflare D1.
 */
const IN_LIST_MAX_BYTES = 40_000
const utf8 = new TextEncoder()

export const collectionQueryBuilder = <T extends keyof Collections>(collection: T, fetch: (collection: T, sql: string) => Promise<Collections[T][]>, detectedLocale?: string): CollectionQueryBuilder<Collections[T]> => {
  const collectionMeta = manifestMeta[String(collection)]
  const i18nConfig: CollectionI18nConfig | undefined = collectionMeta?.i18n
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
    // Set by `.locale()`, the last call wins.
    locale: undefined as { locale: string, fallback?: string } | undefined,
    // Set by `.locale()` and by manual filters on `locale`, both disable auto-locale.
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
      // Trim slashes in linear time, a regex such as /\/+$/ backtracks on long runs.
      let start = 0
      let end = stem.length
      while (start < end && stem.charCodeAt(start) === 47) start++
      while (end > start && stem.charCodeAt(end - 1) === 47) end--
      return query.where('stem', '=', stem.slice(start, end))
    },
    locale(locale: string, opts?: { fallback?: string }) {
      // Dev-only guard. Without i18n the table has no `locale` column, so the query fails
      // with a "no such column" SQL error far from the call site. The manifest has no
      // i18n config when the option is missing or `i18n: true` could not be resolved.
      if (import.meta.dev && !i18nConfig) {
        console.warn(
          `[@nuxt/content] queryCollection("${String(collection)}").locale(${JSON.stringify(locale)}): `
          + `collection "${String(collection)}" has no i18n locales, so the query will fail at the database. `
          + 'Set `i18n: { locales, defaultLocale }` on the collection, or `i18n: true` with `@nuxtjs/i18n` configured.',
        )
      }
      params.localeExplicitlySet = true
      params.locale = opts?.fallback ? { locale, fallback: opts.fallback } : { locale }
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
      const { condition, fallback } = resolveLocale()
      if (fallback) {
        return fetchWithLocaleFallback(fallback, params.limit)
      }
      return fetch(collection, buildQuery({ extraCondition: condition })).then(res => (res || []) as Collections[T][])
    },
    async first(): Promise<Collections[T] | null> {
      const { condition, fallback } = resolveLocale()
      if (fallback) {
        return fetchWithLocaleFallback(fallback, 1).then(res => res[0] || null)
      }
      return fetch(collection, buildQuery({ limit: 1, extraCondition: condition })).then(res => res[0] || null)
    },
    async count(field: keyof Collections[T] | '*' = '*', distinct: boolean = false) {
      const { condition, fallback } = resolveLocale()
      if (fallback) {
        // Without filters, each stem of either locale is served once.
        if (field === '*' && params.conditions.length === 0) {
          return fetch(collection, buildQuery({
            count: { field: 'stem', distinct: true },
            extraCondition: localeInCondition(fallback),
            noLimitOffset: true,
          })).then(m => (m[0] as { count: number }).count)
        }
        if (field === '*') {
          return (await resolveLocaleRows(fallback, [])).rows.length
        }
        // Like SQL `COUNT`, skip NULL values, which reads turn into `false` or `undefined`.
        // The values of both locales are read next to the keys and kept for served rows.
        const [{ rows }, values] = await Promise.all([
          resolveLocaleRows(fallback, []),
          fetch(collection, buildQuery({
            selectedFields: ['id', field] as Array<keyof Collections[T]>,
            conditions: [...params.conditions, localeInCondition(fallback), `("${String(field)}" IS NOT NULL)`],
            noLimitOffset: true,
          })) as unknown as Promise<Row[]>,
        ])
        const served = new Set(rows.map(row => row.id))
        const counted = values.filter(row => served.has(row.id))
        return distinct
          ? new Set(counted.map(row => JSON.stringify(row[String(field)]))).size
          : counted.length
      }
      // A COUNT query returns a single row, so LIMIT and OFFSET must not apply to it.
      return fetch(collection, buildQuery({
        count: { field: String(field), distinct },
        extraCondition: condition,
        noLimitOffset: true,
      })).then(m => (m[0] as { count: number }).count)
    },
  }

  /**
   * Locale handling for one execution. Derived from `params` without mutating them,
   * so a builder can run several terminal methods concurrently. Returns either a
   * condition for a single query, or the locale pair for a fallback lookup.
   */
  function resolveLocale(): { condition?: string, fallback?: LocaleFallback } {
    if (params.locale) {
      const { locale, fallback } = params.locale
      return fallback ? { fallback: { locale, fallback } } : { condition: `("locale" = ${singleQuote(locale)})` }
    }
    if (params.localeExplicitlySet || !i18nConfig || !detectedLocale) {
      return {}
    }
    // A locale outside the collection locales has no translations, like a declared locale without content.
    if (!i18nConfig.locales.includes(detectedLocale)) {
      const warning = `${String(collection)}:${detectedLocale}`
      if (import.meta.dev && !unknownLocaleWarnings.has(warning)) {
        unknownLocaleWarnings.add(warning)
        console.warn(
          `[@nuxt/content] queryCollection("${String(collection)}"): the active locale ${JSON.stringify(detectedLocale)} is not one of `
          + `the collection locales [${i18nConfig.locales.map(l => `"${l}"`).join(', ')}], so results use the default locale "${i18nConfig.defaultLocale}".`,
        )
      }
      return { condition: `("locale" = ${singleQuote(i18nConfig.defaultLocale)})` }
    }
    if (detectedLocale === i18nConfig.defaultLocale) {
      return { condition: `("locale" = ${singleQuote(detectedLocale)})` }
    }
    return { fallback: { locale: detectedLocale, fallback: i18nConfig.defaultLocale } }
  }

  /**
   * Read the rows of a fallback lookup in database order. Each stem is served by its
   * row in `locale` when one exists, otherwise by its row in `fallback`. Filters
   * apply to the served row: a translation that exists but does not match them hides
   * its stem instead of letting the fallback row through.
   *
   * `fields` lists the columns to read, `'*'` reads all of them. `id`, `stem` and
   * `locale` are always read because the resolution needs them. With `window`, only
   * that slice of the result is read, and `complete` tells whether it was the last one.
   */
  async function resolveLocaleRows(localeFallback: LocaleFallback, fields: ReadonlyArray<keyof Collections[T]> | '*', window?: KeyWindow): Promise<{ rows: Row[], complete: boolean }> {
    const { locale } = localeFallback
    const conditions = window?.conditions ?? params.conditions
    const rows = await fetch(collection, buildQuery({
      selectedFields: fields === '*' ? [] : [...fields, ...LOCALE_KEY_FIELDS] as Array<keyof Collections[T]>,
      conditions: [...conditions, localeInCondition(localeFallback)],
      ...(window ? { window } : { noLimitOffset: true }),
    })) as unknown as Row[] | undefined ?? []
    const complete = !window || rows.length < window.limit

    const translated = window?.translated ?? new Set()
    for (const row of rows) {
      if (row.locale === locale) {
        translated.add(row.stem)
      }
    }
    // Once all rows are read, an unfiltered result holds every translation. Otherwise
    // a translation outside the result can still hide a fallback row.
    if (conditions.length > 0 || !complete) {
      const candidates = [...new Set(rows.filter(row => row.locale !== locale && !translated.has(row.stem)).map(row => row.stem))]
      const existing = await fetchInChunks(candidates, chunk => buildQuery({
        selectedFields: ['stem'] as Array<keyof Collections[T]>,
        conditions: [`("locale" = ${singleQuote(locale)})`, `("stem" IN (${chunk.map(singleQuote).join(', ')}))`],
        noLimitOffset: true,
      }))
      for (const row of existing) {
        translated.add(row.stem)
      }
    }

    return { rows: rows.filter(row => row.locale === locale || !translated.has(row.stem)), complete }
  }

  /**
   * Fallback lookup for `all()` and `first()`. With a limit, the page is resolved
   * from growing windows of key rows, and only its rows are read in full, so
   * `first()` and `limit()` do not read every row of both locales.
   */
  async function fetchWithLocaleFallback(localeFallback: LocaleFallback, limit: number): Promise<Collections[T][]> {
    // Read the builder state before the first query, like a single query does.
    const selected = [...params.selectedFields]
    // Same tests as `buildQuery`, numeric strings included.
    const offset = params.offset > 0 ? Number(params.offset) : 0
    const pick = (row: Row) => (selected.length
      ? Object.fromEntries(selected.map(field => [field, row[String(field)]]))
      : row) as Collections[T]

    if (!(limit > 0)) {
      const { rows } = await resolveLocaleRows(localeFallback, selected.length ? selected : '*')
      return rows.map(pick)
    }

    // Same rule as `buildQuery`: the offset only applies together with a limit.
    const end = offset + Number(limit)
    const keys: Row[] = []
    const state = { conditions: [...params.conditions], orderBy: [...params.orderBy], translated: new Set() }
    // A stem has at most two key rows, so the first window usually holds the page.
    for (let start = 0, size = Math.max(2 * end, KEY_WINDOW_SIZE); keys.length < end; start += size, size *= 4) {
      const window = await resolveLocaleRows(localeFallback, [], { ...state, offset: start, limit: size })
      keys.push(...window.rows)
      if (window.complete) {
        break
      }
    }
    const ids = keys.slice(offset, end).map(row => row.id)
    const rows = await fetchInChunks(ids, chunk => buildQuery({
      selectedFields: selected.length ? [...selected, 'id' as keyof Collections[T]] : [],
      conditions: [`("id" IN (${chunk.map(singleQuote).join(', ')}))`],
      noLimitOffset: true,
    }))
    const position = new Map(ids.map((id, index) => [id, index]))
    return rows
      .sort((a, b) => position.get(a.id)! - position.get(b.id)!)
      .map(pick)
  }

  /** Run one query per chunk of values, keeping each `IN (...)` list under `IN_LIST_MAX_BYTES`. */
  async function fetchInChunks(values: unknown[], build: (chunk: unknown[]) => string): Promise<Row[]> {
    const chunks: unknown[][] = []
    let bytes = 0
    for (const value of values) {
      const size = utf8.encode(singleQuote(value)).length + 2
      if (!chunks.length || bytes + size > IN_LIST_MAX_BYTES) {
        chunks.push([])
        bytes = 0
      }
      chunks.at(-1)!.push(value)
      bytes += size
    }
    const results = await Promise.all(chunks.map(chunk => fetch(collection, build(chunk))))
    return results.flatMap(res => (res || []) as unknown as Row[])
  }

  function buildQuery(opts: {
    count?: { field: string, distinct: boolean }
    limit?: number
    /** Replaces the conditions set on the builder. */
    conditions?: string[]
    extraCondition?: string
    noLimitOffset?: boolean
    selectedFields?: ReadonlyArray<keyof Collections[T]>
    /** Reads one slice in the given order, instead of the builder's order, limit and offset. */
    window?: Pick<KeyWindow, 'offset' | 'limit' | 'orderBy'>
  } = {}) {
    let query = 'SELECT '
    if (opts?.count) {
      query += `COUNT(${opts.count.distinct ? 'DISTINCT ' : ''}${opts.count.field}) as count`
    }
    else {
      const fields = Array.from(new Set(opts.selectedFields ?? params.selectedFields))
      query += fields.length > 0 ? fields.map(f => `"${String(f)}"`).join(', ') : '*'
    }
    query += ` FROM ${tables[String(collection)]}`

    const conditions = [...(opts.conditions ?? params.conditions)]
    if (opts.extraCondition) {
      conditions.push(opts.extraCondition)
    }
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    const orderBy = opts.window?.orderBy ?? params.orderBy
    if (orderBy.length > 0) {
      query += ` ORDER BY ${orderBy.join(', ')}`
    }
    else {
      query += ` ORDER BY stem ASC`
    }

    if (opts.window) {
      // Ties break by `id`, so consecutive windows neither repeat nor skip rows.
      const { offset, limit } = opts.window
      return `${query}, "id" ASC LIMIT ${limit}${offset > 0 ? ` OFFSET ${offset}` : ''}`
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

function localeInCondition({ locale, fallback }: LocaleFallback) {
  return `("locale" IN (${singleQuote(locale)}, ${singleQuote(fallback)}))`
}

function singleQuote(value: unknown) {
  return `'${String(value).replace(/'/g, '\'\'')}'`
}
