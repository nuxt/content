import type { H3Event } from 'h3'
import type { MarkdownNode, ParsedContent, QueryBuilderWhere } from '../types'
import { serverQueryContent } from '#content/server'

export async function serverSearchContent (event: H3Event, filterQuery?: QueryBuilderWhere): Promise<ParsedContent[]> {
  if (filterQuery) {
    return await serverQueryContent(event).where(filterQuery).find()
  } else {
    return await serverQueryContent(event).find()
  }
}

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
  content: string,
}

const HEADING = /^h([1-6])$/
const isHeading = (tag: string) => HEADING.test(tag)

export function splitPageIntoSections (page: ParsedContent, { ignoredTags }: { ignoredTags: string[] }) {
  const path = page._path ?? ''

  // TODO: title in frontmatter must be added
  const sections: Section[] = []

  if (!page?.body?.children) {
    return sections
  }

  // No section
  let section = 0
  let previousHeadingLevel = 0
  const titles = []
  for (const item of page.body.children) {
    const tag = item.tag || ''
    if (isHeading(tag)) {
      const currentHeadingLevel: number = Number(tag.match(HEADING)?.[1] ?? 0)

      const title = extractTextFromAst(item).trim()

      if (currentHeadingLevel === 1) {
        // Reset the titles
        titles.splice(0, titles.length)
      } else if (currentHeadingLevel < previousHeadingLevel) {
        // Go up tree, remove every title after the current level
        titles.splice(currentHeadingLevel - 1, titles.length - 1)
      } else if (currentHeadingLevel === previousHeadingLevel) {
        // Same level, remove the last title (add title later to avoid to it in titles)
        titles.pop()
      }

      sections.push({
        id: `${path}#${item.props?.id}`,
        title,
        titles: [...titles],
        content: '',
        level: currentHeadingLevel
      })

      titles.push(title)

      // Swap to a new section
      previousHeadingLevel = currentHeadingLevel
      section += 1
    }

    if (!isHeading(tag)) {
      if (!sections[section]) {
        sections[section] = {
          id: path,
          title: page.title || '',
          titles: [],
          content: '',
          level: 1
        }
      }

      sections[section].content += extractTextFromAst(item, ignoredTags).trim()
    }
  }

  return sections
}

// TODO: Should be tested
function extractTextFromAst (node: MarkdownNode, ignoredTags: string[] = []) {
  let text = ''

  // Get text from markdown AST
  if (node.type === 'text') {
    text += (node.value || '').trim()
  }

  // Do not explore children
  if (ignoredTags.includes(node.tag ?? '')) {
    return ''
  }

  // Explore children
  if (node.children) {
    text += node.children.map(child => extractTextFromAst(child, ignoredTags)).filter(Boolean).join(' ')
  }

  return text
}
