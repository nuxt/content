import { defineEventHandler } from 'h3'
import MiniSearch from 'minisearch'
import { ParsedContent } from '../../types'
import { useRuntimeConfig } from '#imports'
import { serverQueryContent } from '#content/server'

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

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { indexedSearch, ignoredTags, options } = runtimeConfig.public.content.search

  const files = await serverQueryContent(event).find()

  // Only works for MD
  const sections = (await Promise.all(
    files
      .filter(file => file._extension === 'md' && !file?._draft && !file?.empty)
      .map(page => splitPageIntoSections(page, { ignoredTags }))))
    .flat()

  if (indexedSearch) {
    // Add an option to enable index
    const miniSearch = new MiniSearch(options)

    // Index the documents
    miniSearch.addAll(sections)

    // Send the index to the client
    return JSON.stringify(miniSearch)
  }

  return sections
})

function splitPageIntoSections (page: ParsedContent, { ignoredTags }: { ignoredTags: string[] }) {
  const path = page._path ?? ''

  const sections: Section[] = []

  // No section
  let section = -1
  let previousHeadingLevel = 0
  const titles = []
  for (const item of page.body.children) {
    if (isHeading(item.tag)) {
      const currentHeadingLevel: number = Number(item.tag.match(HEADING)?.[1]) ?? 0

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
        id: `${path}#${item.props.id}`,
        title,
        titles: [...titles],
        content: '',
        level: currentHeadingLevel
      })

      if (currentHeadingLevel > previousHeadingLevel) {
        // Go down tree, add the title
        titles.push(title)
      } else if (currentHeadingLevel === previousHeadingLevel) {
        // Same level, add the title
        titles.push(title)
      } if (currentHeadingLevel < previousHeadingLevel) {
        // Go up tree, add the title
        titles.push(title)
      }

      // Swap to a new section
      previousHeadingLevel = currentHeadingLevel
      section += 1
    }

    if (!isHeading(item.tag)) {
      if (!sections[section]) {
        sections[section] = {
          id: '',
          title: '',
          titles: [],
          content: '',
          level: 0
        }
      }

      sections[section].content += extractTextFromAst(item, ignoredTags).trim()
    }
  }

  return sections
}

// TODO: Should be tested
function extractTextFromAst (node: any, ignoredTags: string[] = []) {
  let text = ''

  // Get text from markdown AST
  if (node.type === 'text') {
    text += node.value
  }

  // Do not explore children
  if (ignoredTags.includes(node.tag ?? '')) {
    return ''
  }

  if (node.tag === 'style') {
    return ''
  }

  // Explore children
  if (node.children) {
    for (const child of node.children) {
      text += ' ' + extractTextFromAst(child, ignoredTags)
    }
  }

  return text
}