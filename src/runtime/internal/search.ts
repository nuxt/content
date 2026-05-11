import type { MDCNode, MDCRoot, MDCElement } from '@nuxtjs/mdc'
import { toHast } from 'minimark/hast'
import type { MinimarkTree } from 'minimark'
import { pick } from './utils'
import type { CollectionQueryBuilder, DatabaseAdapter, PageCollectionItemBase } from '~/src/types'

type Section = {
  // Path to the section
  id: string
  // Title of the section
  title: string
  // Parents sections titles
  titles: string[]
  // Level of the section
  level: number
  // Content of the section
  content: string
}

export type SearchResult = {
  collection: string
  id: string
  title: string
  titles: string[]
  level: number
  content: string
  rank: number
  snippets?: { title?: string, content?: string }
}

export type SearchCollectionOptions = {
  /**
   * Maximum number of results to return.
   * @default 50
   */
  limit?: number
  /** Restrict search to specific columns. Searches all columns when omitted. */
  fields?: ('title' | 'content')[]
  /**
   * Ignore search terms shorter than this value.
   * @default 1
   */
  minTermLength?: number
  /** Control how matches in different columns and heading levels affect ranking. */
  weights?: {
    /**
     * Boost factor for matches in the title column.
     * @default 10
     */
    title?: number
    /**
     * Boost factor for matches in the content column.
     * @default 5
     */
    content?: number
    /**
     * Whether to boost higher-level sections (h1 > h2 > h3...).
     * Set to `false` to disable level-based boosting.
     * @default true
     */
    heading?: boolean
  }
  /** Return text snippets with highlighted matches for the specified columns. */
  snippet?: {
    /**
     * Which columns to extract snippets from.
     * @default ['content']
     */
    columns?: ('title' | 'content')[]
    /**
     * Number of tokens around the match to include.
     * @default 30
     */
    around?: number
    /**
     * HTML tag used to wrap matched terms.
     * @default 'mark'
     */
    tag?: string
  }
}

const HEADING = /^h([1-6])$/
const headingLevel = (tag: string) => Number(tag.match(HEADING)?.[1] ?? 0)

interface SectionablePage {
  path: string
  title: string
  description: string
  body: MDCRoot | MinimarkTree
}

export type GenerateSearchSectionsOptions = {
  ignoredTags?: string[]
  extraFields?: (string | symbol | number)[]
  minHeading?: `h${1 | 2 | 3 | 4 | 5 | 6}`
  maxHeading?: `h${1 | 2 | 3 | 4 | 5 | 6}`
}

export async function generateSearchSections<T extends PageCollectionItemBase>(queryBuilder: CollectionQueryBuilder<T>, opts?: GenerateSearchSectionsOptions) {
  const { ignoredTags = [], extraFields = [], minHeading = 'h1', maxHeading = 'h6' } = opts || {}
  const minLevel = headingLevel(minHeading)
  const maxLevel = headingLevel(maxHeading)

  const documents = await queryBuilder
    .where('extension', '=', 'md')
    .select('path', 'body', 'description', 'title', ...(extraFields as Array<keyof T> || []))
    .all()

  return documents.flatMap(doc => splitPageIntoSections(doc, { ignoredTags, extraFields: extraFields as string[], minLevel, maxLevel }))
}

function splitPageIntoSections(page: SectionablePage, { ignoredTags, extraFields, minLevel, maxLevel }: { ignoredTags: string[], extraFields: Array<string>, minLevel: number, maxLevel: number }) {
  const body = (!page.body || page.body?.type === 'root') ? page.body : toHast(page.body as unknown as MinimarkTree) as MDCRoot
  const path = (page.path ?? '')
  const extraFieldsData = pick(extraFields)(page as unknown as Record<string, unknown>)

  // TODO: title in frontmatter must be added
  const sections: Section[] = [{
    ...extraFieldsData,
    id: path,
    title: page.title as string || '',
    titles: [],
    content: (page.description || '').trim(),
    level: 1,
  }]

  if (!body?.children) {
    return sections
  }

  let section = 1
  let previousHeadingLevel = 0
  const titles = [page.title ?? '']
  for (const item of body.children) {
    const tag = (item as MDCElement).tag || ''
    const level = headingLevel(tag)
    if (level >= minLevel && level <= maxLevel) {
      const title = extractTextFromAst(item).trim()

      if (level === 1) {
        titles.splice(0, titles.length)
      }
      else if (level < previousHeadingLevel) {
        titles.splice(level - 1, titles.length - 1)
      }
      else if (level === previousHeadingLevel) {
        titles.pop()
      }

      sections.push({
        ...extraFieldsData,
        id: `${path}#${(item as MDCElement).props?.id}`,
        title,
        titles: [...titles],
        content: '',
        level,
      })

      titles.push(title)
      previousHeadingLevel = level
      section += 1
    }
    else {
      const content = extractTextFromAst(item, ignoredTags).trim()

      if (section === 1 && sections[section - 1]?.content === content) {
        continue
      }

      sections[section - 1]!.content = `${sections[section - 1]!.content} ${content}`.trim()
    }
  }

  return sections
}

function extractTextFromAst(node: MDCNode, ignoredTags: string[] = []) {
  let text = ''

  // Get text from markdown AST
  if (node.type === 'text') {
    text += (node.value || '')
  }

  // Do not explore children
  if (ignoredTags.includes((node as MDCElement).tag ?? '')) {
    return ''
  }

  // Explore children
  if ((node as MDCElement).children?.length) {
    text += (node as MDCElement).children.map((child: MDCNode) => extractTextFromAst(child, ignoredTags)).filter(Boolean).join('')
  }

  return text
}

const FTS_TABLE = '_fts_search'
const indexedCollections = new Set<string>()
let ftsTableCreated = false

export function _resetFTSState() {
  indexedCollections.clear()
  ftsTableCreated = false
}

export async function resetFTSIndex(db: DatabaseAdapter) {
  await db.exec(`DROP TABLE IF EXISTS ${FTS_TABLE}`)
  indexedCollections.clear()
  ftsTableCreated = false
}

export async function buildFTSIndex<T extends PageCollectionItemBase>(
  db: DatabaseAdapter,
  collection: string,
  queryBuilder: CollectionQueryBuilder<T>,
  opts?: GenerateSearchSectionsOptions,
) {
  if (indexedCollections.has(collection)) {
    return
  }

  if (!ftsTableCreated) {
    await db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS ${FTS_TABLE} USING fts5(collection UNINDEXED, id UNINDEXED, title, title_normalized, titles UNINDEXED, content, level UNINDEXED)`)
    ftsTableCreated = true
  }

  const sections = await generateSearchSections(queryBuilder, opts)

  for (const section of sections) {
    const titleNormalized = section.title.replace(/([a-z])([A-Z])/g, '$1 $2')

    await db.exec(
      `INSERT INTO ${FTS_TABLE} (collection, id, title, title_normalized, titles, content, level) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [collection, section.id, section.title, titleNormalized, JSON.stringify(section.titles), section.content, section.level],
    )
  }

  indexedCollections.add(collection)
}

export async function queryFTS(
  db: DatabaseAdapter,
  collections: string[],
  query: string,
  opts?: SearchCollectionOptions,
): Promise<SearchResult[]> {
  const { limit = 50, snippet, fields, minTermLength = 1, weights } = opts || {}

  const titleWeight = weights?.title ?? 10
  const contentWeight = weights?.content ?? 5
  const headingBoost = weights?.heading !== false

  const tag = (snippet?.tag ?? 'mark').replace(/[^a-z0-9]/gi, '')
  const pre = `<${tag}>`
  const post = `</${tag}>`

  const placeholders = collections.map(() => '?').join(', ')
  const collectionFilter = `collection IN (${placeholders})`

  const bm25Expr = `bm25(${FTS_TABLE}, 0, 0, ${titleWeight}, ${titleWeight}, 0, ${contentWeight}, 0)`
  const rankExpr = headingBoost ? `(${bm25Expr} / level)` : bm25Expr
  let selectClause = `collection, id, title, titles, content, level, ${rankExpr} as rank`
  const snippetColumns = snippet?.columns ?? (snippet ? ['content'] : [])
  const around = Number(snippet?.around) || 30
  const wantContentSnippet = snippetColumns.includes('content')
  if (wantContentSnippet) {
    selectClause += `, snippet(${FTS_TABLE}, 5, '${pre}', '${post}', '...', ${around}) as snippet_content`
  }

  const terms = query.split(/\s+/).filter(t => t.length >= minTermLength)
  if (!terms.length) return []

  const ftsQuery = terms.map((term) => {
    const escaped = term.replace(/"/g, '""')
    if (fields?.length) {
      return fields.map(f => `${f} : "${escaped}"*`).join(' OR ')
    }
    return `"${escaped}"*`
  }).join(' ')

  const sql = `SELECT ${selectClause} FROM ${FTS_TABLE} WHERE ${FTS_TABLE} MATCH ? AND ${collectionFilter} ORDER BY rank LIMIT ?`
  const params = [ftsQuery, ...collections, limit]

  let rows: Record<string, unknown>[]
  try {
    rows = await db.all<Record<string, unknown>>(sql, params)
  }
  catch (err) {
    if (import.meta.dev) {
      console.warn('[nuxt-content] FTS query failed:', err)
    }
    return []
  }

  const wantTitleSnippet = snippetColumns.includes('title')
  const titleRegex = wantTitleSnippet
    ? new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    : null

  return rows.map(row => ({
    collection: row.collection as string,
    id: row.id as string,
    title: row.title as string,
    titles: JSON.parse((row.titles as string) || '[]'),
    level: row.level as number,
    content: row.content as string,
    rank: row.rank as number,
    ...(snippetColumns.length && {
      snippets: {
        ...(wantTitleSnippet && { title: (row.title as string).replace(titleRegex!, `${pre}$1${post}`) }),
        ...(wantContentSnippet && { content: row.snippet_content as string }),
      },
    }),
  }))
}
