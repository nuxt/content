import type { ComarkCMS, CMSFile, CMSListFile } from '@comark/cms'
import type {
  SQLOperator,
  QueryGroupFunction,
  QueryField,
  SourceQueryBuilder,
} from '@comark/cms/database/utils/query'

/**
 * The full document shape a hydrated query returns: the lightweight query row
 * ({@link CMSListFile}) upgraded with the parsed `nodes` (body/tree). This
 * mirrors Nuxt Content v3, where `queryCollection().first()` resolved to the
 * whole document — frontmatter *and* body — ready to hand to `<ContentRenderer>`.
 */
export type FullFile<Item> = Item extends CMSListFile<infer Data> ? CMSFile<Data> : Item & Pick<CMSFile, 'nodes'>

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
async function hydrate<Item extends { path: string }>(
  cms: Pick<ComarkCMS, 'get'>,
  item: Item,
): Promise<FullFile<Item>> {
  const full = await cms.get(item.path)
  return (full ?? { ...item, nodes: [] }) as FullFile<Item>
}

/**
 * Wrap a query builder so that `all()`/`first()` return full documents
 * (including the parsed `nodes` body/tree) instead of the lightweight rows the
 * SQL layer produces. Chainable methods are proxied so filtering/ordering keeps
 * working; the wrapper is re-applied on every chain step.
 */
export function withFullFiles<Row, Item extends { path: string }>(
  cms: Pick<ComarkCMS, 'get'>,
  builder: SourceQueryBuilder<Row, Item>,
): FullFileQueryBuilder<Row, Item> {
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
