import type { MDCNode, MDCRoot, MDCElement } from '@nuxtjs/mdc'
import { toHast } from 'minimark/hast'
import type { MinimarkTree } from 'minimark'
import { pick } from './utils'
import type { CollectionQueryBuilder, PageCollectionItemBase } from '~/src/types'

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

const HEADING = /^h([1-6])$/
const headingLevel = (tag: string) => Number(tag.match(HEADING)?.[1] ?? 0)

interface SectionablePage {
  path: string
  title: string
  description: string
  body: MDCRoot | MinimarkTree
}

export async function generateSearchSections<T extends PageCollectionItemBase>(queryBuilder: CollectionQueryBuilder<T>, opts?: { ignoredTags?: string[], extraFields?: Array<keyof T>, minHeading?: `h${1 | 2 | 3 | 4 | 5 | 6}`, maxHeading?: `h${1 | 2 | 3 | 4 | 5 | 6}` }) {
  const { ignoredTags = [], extraFields = [], minHeading = 'h1', maxHeading = 'h6' } = opts || {}
  const minLevel = headingLevel(minHeading)
  const maxLevel = headingLevel(maxHeading)

  const documents = await queryBuilder
    .where('extension', '=', 'md')
    .select('path', 'body', 'description', 'title', ...(extraFields || []))
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
