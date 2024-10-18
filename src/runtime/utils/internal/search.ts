import type { MDCNode, MDCRoot, MDCElement } from '@nuxtjs/mdc'
import type { MinimalTree } from '@nuxt/content'
import { decompressTree } from './abstract-tree'

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
const isHeading = (tag: string) => HEADING.test(tag)

interface SectionablePage {
  path: string
  title: string
  description: string
  body: MDCRoot
}

export function splitPageIntoSections(page: SectionablePage, { ignoredTags }: { ignoredTags: string[] }) {
  const body = (!page.body || page.body?.type === 'root') ? page.body : decompressTree(page.body as unknown as MinimalTree)
  const path = (page.path ?? '')

  // TODO: title in frontmatter must be added
  const sections: Section[] = [{
    id: path,
    title: page.title as string || '',
    titles: [],
    content: (page.description || '').trim(),
    level: 1,
  }]

  if (!page?.body?.children) {
    return sections
  }

  // No section
  let section = 1
  let previousHeadingLevel = 0
  const titles = [page.title ?? '']
  for (const item of body.children) {
    const tag = (item as MDCElement).tag || ''
    if (isHeading(tag)) {
      const currentHeadingLevel: number = Number(tag.match(HEADING)?.[1] ?? 0)

      const title = extractTextFromAst(item).trim()

      if (currentHeadingLevel === 1) {
        // Reset the titles
        titles.splice(0, titles.length)
      }
      else if (currentHeadingLevel < previousHeadingLevel) {
        // Go up tree, remove every title after the current level
        titles.splice(currentHeadingLevel - 1, titles.length - 1)
      }
      else if (currentHeadingLevel === previousHeadingLevel) {
        // Same level, remove the last title (add title later to avoid to it in titles)
        titles.pop()
      }

      sections.push({
        id: `${path}#${(item as MDCElement).props?.id}`,
        title,
        titles: [...titles],
        content: '',
        level: currentHeadingLevel,
      })

      titles.push(title)

      // Swap to a new section
      previousHeadingLevel = currentHeadingLevel
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
