import type { ComarkCMS, CMSFile, CMSListFile } from '@comark/cms'
import type {
  SQLOperator,
  QueryGroupFunction,
  QueryField,
  SourceQueryBuilder,
} from '@comark/cms/database/utils/query'

/**
 * The full document shape a hydrated query returns, mirroring the Nuxt Content
 * v3 collection item: the frontmatter (`Data`) is flattened onto the top level
 * alongside the identity/meta fields and the parsed `nodes` (body/tree), ready
 * to hand to `<ContentRenderer>`.
 *
 * - `id` — the file key (v3 renamed the CMS `meta.key` to `id`).
 * - `path`/`stem`/`extension` — surfaced from `path`/`meta` for convenience.
 * - frontmatter (`Data`) is spread flat so `doc.title` works like v3.
 * - `nodes`/`meta` — the parsed body and file metadata.
 */
export type FullFile<Item> = Item extends CMSListFile<infer Data>
  ? Data & {
    id: string
    path: string
    stem: string
    extension: string
    body: CMSFile<Data>['nodes']
    meta: CMSFile<Data>['meta']
  }
  : Item & Pick<CMSFile, 'nodes'>

/**
 * A {@link SourceQueryBuilder} whose terminal reads resolve to full documents.
 * Filtering/ordering methods stay chainable; `all()`/`first()` return
 * {@link FullFile}s (with `nodes`), while `count()` is untouched.
 */
export interface FullFileQueryBuilder<Row, Item> {
  path(path: string): FullFileQueryBuilder<Row, Item>
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
 * the parsed body — so we re-read the whole file via `cms.get()`. When the file
 * can no longer be resolved (e.g. removed between the query and the read) we
 * fall back to the row itself with an empty body so callers still get an object.
 */
async function hydrate<Item extends CMSListFile>(
  cms: Pick<ComarkCMS, 'get'>,
  item: Item,
): Promise<FullFile<Item>> {
  const source = (await cms.get(item.path)) ?? { ...item, nodes: [] as CMSFile['nodes'] }

  return {
    // Spread the frontmatter first so the identity/meta fields below always win.
    ...source.data,
    id: source.meta.key,
    path: source.path,
    stem: source.meta.stem,
    extension: source.meta.extension,
    body: source.nodes,
    meta: source.meta,
  } as FullFile<Item>
}

/**
 * Wrap a query builder so that `all()`/`first()` return full documents
 * (including the parsed `nodes` body/tree) instead of the lightweight rows the
 * SQL layer produces. Chainable methods are proxied so filtering/ordering keeps
 * working; the wrapper is re-applied on every chain step.
 */
// `Record<string, any>` mirrors `CMSListFile`'s own data constraint — generated
// collection data interfaces have no index signature and don't satisfy
// `Record<string, unknown>`, which would break inference of the source's data type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withFullFiles<Row, Data extends Record<string, any>>(
  cms: Pick<ComarkCMS, 'get'>,
  builder: SourceQueryBuilder<Row, CMSListFile<Data>>,
): FullFileQueryBuilder<Row, CMSListFile<Data>> {
  type Item = CMSListFile<Data>
  const wrap = (qb: SourceQueryBuilder<Row, Item>): FullFileQueryBuilder<Row, Item> => ({
    path: path => wrap(qb.path(path)),
    order: (field, direction) => wrap(qb.order(field, direction)),
    skip: skip => wrap(qb.skip(skip)),
    limit: limit => wrap(qb.limit(limit)),
    where: (field, operator, value) => wrap(qb.where(field, operator, value)),
    andWhere: groupFactory => wrap(qb.andWhere(groupFactory)),
    orWhere: groupFactory => wrap(qb.orWhere(groupFactory)),
    count: (field, distinct) => qb.count(field, distinct),
    async all() {
      const list = await qb.all()
      return Promise.all(list.map(item => hydrate(cms, item)))
    },
    async first() {
      const item = await qb.first()
      return item ? hydrate(cms, item) : null
    },
  })

  return wrap(builder)
}
