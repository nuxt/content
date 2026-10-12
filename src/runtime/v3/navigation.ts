import type { ContentListFile, NavigationItem } from 'comark-content'

const SEMVER_REGEX = /^\d+(?:\.\d+)*(?:\.x)?$/

type Listable = {
  list?: (sources?: string | string[]) => Promise<ContentListFile[]>
}

/**
 * Rows `queryCollectionNavigation()` reads back from the SQL index.
 *
 * Content v3 stored `navigation` as one JSON column, so `navigation.title` survived
 * the query. Comark only hoists nested fields when a property is a pure object;
 * v3's `boolean | object` schema therefore becomes a single `data.navigation` column,
 * while the indexer writes `data.navigation.title` and never fills that column.
 * The value comes back null, and every link that took its title from it is untitled.
 *
 * Overlay the manifest entry (frontmatter, not the parsed body) so the object — and
 * `navigation: false` — are what `generateNavigation` sees. Fill a missing title from
 * the file name, which is what v3's path-meta transformer did at parse time.
 */
export async function navigationItems(content: unknown, collection: string, rows: ContentListFile[]): Promise<ContentListFile[]> {
  const listed = await listCollection(content as Listable, collection)
  const byKey = new Map<string, ContentListFile>()
  const byPath = new Map<string, ContentListFile>()
  for (const item of listed) {
    if (item.meta?.key) byKey.set(item.meta.key, item)
    if (item.path) byPath.set(item.path, item)
  }

  return rows.map((row) => {
    const full = (row.meta?.key && byKey.get(row.meta.key)) || (row.path && byPath.get(row.path))
    return withNavigationData(full ? { ...row, data: { ...row.data, ...full.data } } : row)
  })
}

/**
 * v3 copied the requested extra fields onto each link, after `title` and under the
 * `navigation` object so `navigation.title` still won.
 */
export function applyExtraFields(items: NavigationItem[], rows: ContentListFile[], fields?: string[]): NavigationItem[] {
  if (!fields?.length) return items
  const byPath = new Map(rows.map(row => [row.path, row.data as Record<string, unknown> | undefined]))
  const visit = (nodes: NavigationItem[]): NavigationItem[] => nodes.map((node) => {
    const data = byPath.get(node.path)
    const extra = data
      ? Object.fromEntries(fields.filter(field => data[field] !== undefined).map(field => [field, data[field]]))
      : {}
    const navigation = isObject(data?.navigation) ? data.navigation : {}
    return {
      ...node,
      ...extra,
      ...navigation,
      ...(node.children ? { children: visit(node.children) } : {}),
    }
  })
  return visit(items)
}

/**
 * v3 `path-meta`: strip ordering/`index` from the file name, then title-case each
 * space/hyphen-separated word. A leading number is only an ordering prefix when a
 * dot follows it (`1.getting-started`); `1.x` is a version and stays as written.
 */
export function titleFromStem(stem?: string): string {
  if (!stem) return ''
  const basename = stem.split('/').pop() ?? stem
  return refineUrlPart(basename)
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(pascal)
    .join(' ')
}

function withNavigationData(row: ContentListFile): ContentListFile {
  const data = { ...row.data } as Record<string, unknown>
  // A boolean column coerces `navigation: false` to integer 0, which no longer hides the page.
  if (data.navigation === 0) data.navigation = false
  if (!data.title) {
    const title = titleFromStem(row.meta?.stem)
    if (title) data.title = title
  }
  return { ...row, data }
}

async function listCollection(instance: Listable, collection: string): Promise<ContentListFile[]> {
  if (typeof instance.list !== 'function') return []
  try {
    const items = await instance.list([collection])
    return items.filter(item => !item.meta?.source || item.meta.source === collection)
  }
  catch {
    return []
  }
}

function refineUrlPart(name: string): string {
  name = name.split(/[/:]/).pop() ?? name
  if (SEMVER_REGEX.test(name)) return name
  return name
    .replace(/(\d+\.)?(.*)/, '$2')
    .replace(/^index(\.draft)?$/, '')
    .replace(/\.draft$/, '')
}

function pascal(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && Object.prototype.toString.call(value) === '[object Object]'
}
