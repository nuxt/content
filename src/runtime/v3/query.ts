import type { ComarkContent, ContentFile, ContentListFile } from 'comark-content'
import type {
  SQLOperator,
  QueryGroupFunction,
  QueryField,
  SourceQueryBuilder,
} from 'comark-content/database/utils/query'

/**
 * The full document shape a hydrated query returns, mirroring the Nuxt Content
 * v3 collection item: the frontmatter (`Data`) is flattened onto the top level
 * alongside the identity/meta fields and the parsed `nodes` (body/tree), ready
 * to hand to `<ContentRenderer>`.
 *
 * - `id` — the file key (v3 renamed the Comark `meta.key` to `id`).
 * - `path`/`stem`/`extension` — surfaced from `path`/`meta` for convenience.
 * - frontmatter (`Data`) is spread flat so `doc.title` works like v3.
 * - `nodes`/`meta` — the parsed body and file metadata; `meta` also mirrors the
 *   frontmatter, since v3 stored fields outside the schema there.
 */
export type FullFile<Item> = Item extends ContentListFile<infer Data>
  ? Data & {
    id: string
    path: string
    stem: string
    extension: string
    body: ContentFile<Data>['nodes']
    meta: ContentFile<Data>['meta'] & Record<string, any>
  }
  : Item & Pick<ContentFile, 'nodes'>

/**
 * A {@link SourceQueryBuilder} whose terminal reads resolve to full documents.
 * Filtering/ordering methods stay chainable; `all()`/`first()` return
 * {@link FullFile}s (with `nodes`), while `count()` is untouched.
 */
export interface FullFileQueryBuilder<Row, Item> {
  path(path: string): FullFileQueryBuilder<Row, Item>
  /** Return only the given columns. v3 callers pass flat names (`'title'`); dotted names pass through. */
  select(...fields: QueryField<Row>[]): FullFileQueryBuilder<Row, Item>
  order(field: QueryField<Row>, direction: 'ASC' | 'DESC'): FullFileQueryBuilder<Row, Item>
  skip(skip: number): FullFileQueryBuilder<Row, Item>
  limit(limit: number): FullFileQueryBuilder<Row, Item>
  where(field: QueryField<Row>, operator: SQLOperator, value?: unknown): FullFileQueryBuilder<Row, Item>
  andWhere(groupFactory: QueryGroupFunction<Row>): FullFileQueryBuilder<Row, Item>
  orWhere(groupFactory: QueryGroupFunction<Row>): FullFileQueryBuilder<Row, Item>
  all(): Promise<FullFile<Item>[]>
  first(): Promise<FullFile<Item> | null>
  count(field?: QueryField<Row> | '*', distinct?: boolean): Promise<number>
}

/**
 * Fetch the full document for a query row. Query rows only carry the columns
 * stored in the search index (`path` + `meta.*` + frontmatter `data.*`), never
 * the parsed body — so we re-read the whole file via `content.get()`. When the file
 * can no longer be resolved (e.g. removed between the query and the read) we
 * fall back to the row itself with an empty body so callers still get an object.
 */
/**
 * v3 names that aren't frontmatter. `id` is the file key, which the index stores
 * as `meta.key`; the rest are top-level or `meta.*` columns.
 */
const COLUMN_ALIASES: Record<string, string> = {
  id: 'meta.key',
  stem: 'meta.stem',
  extension: 'meta.extension',
}

function toQueryColumn(field: string): string {
  if (field.includes('.')) return field
  return COLUMN_ALIASES[field] ?? (field === 'path' ? field : `data.${field}`)
}

async function hydrate<Item extends ContentListFile>(
  content: Pick<ComarkContent, 'get'>,
  item: Item,
): Promise<FullFile<Item>> {
  // Prefer the file key (`content_fr/index.md`): several collections can share a
  // path, and a hub resolves a bare path to whichever collection registered it first.
  const source = (await content.get(item.meta?.key ?? item.path)) ?? { ...item, nodes: [] as ContentFile['nodes'] }

  return {
    // Spread the frontmatter first so the identity/meta fields below always win.
    ...source.data,
    id: source.meta.key,
    path: source.path,
    stem: source.meta.stem,
    extension: source.meta.extension,
    body: source.nodes,
    // v3 kept frontmatter outside the schema under `meta` (`meta.sitemap`,
    // `meta.modifiedAt`), so mirror the frontmatter there too. The file meta wins
    // on conflict: `meta.key` identifies the document (e.g. for `<ContentRenderer>`).
    meta: { ...source.data, ...source.meta },
  } as FullFile<Item>
}

/**
 * Wrap a query builder so that `all()`/`first()` return full documents
 * (including the parsed `nodes` body/tree) instead of the lightweight rows the
 * SQL layer produces. Chainable methods are proxied so filtering/ordering keeps
 * working; the wrapper is re-applied on every chain step.
 */
// `Record<string, any>` mirrors `ContentListFile`'s own data constraint — generated
// collection data interfaces have no index signature and don't satisfy
// `Record<string, unknown>`, which would break inference of the source's data type.
export function withFullFiles<Row, Data extends Record<string, any>>(
  content: Pick<ComarkContent, 'get'>,
  builder: SourceQueryBuilder<Row, ContentListFile<Data>>,
): FullFileQueryBuilder<Row, ContentListFile<Data>> {
  type Item = ContentListFile<Data>
  const wrap = (qb: SourceQueryBuilder<Row, Item>): FullFileQueryBuilder<Row, Item> => ({
    path: path => wrap(qb.path(path)),
    // v3 addresses frontmatter fields directly (`select('title')`); the SQL layer
    // stores them under `data.*`. Identity columns (`path`, `id`, …) stay as they are,
    // and dotted names pass through untouched.
    // `select` narrows the row type to `Partial<Item>`; hydration re-reads the whole file.
    select: (...fields) => wrap(qb.select(...fields.map(toQueryColumn)) as SourceQueryBuilder<Row, Item>),
    order: (field, direction) => wrap(qb.order(toQueryColumn(field), direction)),
    skip: skip => wrap(qb.skip(skip)),
    limit: limit => wrap(qb.limit(limit)),
    where: (field, operator, value) => wrap(qb.where(toQueryColumn(field), operator, value)),
    andWhere: groupFactory => wrap(qb.andWhere(groupFactory)),
    orWhere: groupFactory => wrap(qb.orWhere(groupFactory)),
    count: (field, distinct) => qb.count(field, distinct),
    async all() {
      const list = await qb.all()
      return Promise.all(list.map(item => hydrate(content, item)))
    },
    async first() {
      const item = await qb.first()
      return item ? hydrate(content, item) : null
    },
  })

  return wrap(builder)
}
