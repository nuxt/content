import { DocusRootNode, DocusMarkdownNode, Toc, TocLink } from '../../../types'
import { expandTags } from '../../runtime/utils'
import { logger } from '../../utils'
import { flattenNode, flattenNodeText } from './utils'

const TOC_TAGS = ['h2', 'h3', 'h4', 'h5', 'h6']

const TOC_TAGS_DEPTH = expandTags(['h2', 'h3', 'h4']).reduce((tags, tag) => {
  tags[tag] = Number(tag.charAt(tag.length - 1))
  return tags
}, {})

const getHeaderDepth = (node: DocusMarkdownNode): number => TOC_TAGS_DEPTH[node.tag]

const getTocTags = (depth: number): string[] => {
  if (depth < 1 || depth > 5) {
    logger.warn(`toc.depth is set to ${depth}. It should be a muber between 1 and 5. `)
    depth = 1
  }

  return TOC_TAGS.slice(0, depth)
}

function nestHeaders(headers: TocLink[]): TocLink[] {
  if (headers.length <= 1) {
    return headers
  }
  const toc: TocLink[] = []
  let parent: TocLink
  headers.forEach(header => {
    if (!parent || header.depth <= parent.depth) {
      header.children = []
      parent = header
      toc.push(header)
    } else {
      parent.children.push(header)
    }
  })
  toc.forEach(header => {
    if (header.children.length) {
      header.children = nestHeaders(header.children)
    } else {
      delete header.children
    }
  })
  return toc
}

export function generateFlatToc(body: DocusRootNode, options: Toc): Toc {
  const { searchDepth, depth, title = '' } = options
  const tags = expandTags(getTocTags(depth))

  const headers = flattenNode(body, searchDepth).filter(node => tags.includes(node.tag))

  const links: TocLink[] = headers.map(node => ({
    id: node.props.id,
    depth: getHeaderDepth(node),
    text: flattenNodeText(node)
  }))
  return {
    title,
    searchDepth,
    depth,
    links
  }
}

export function generateToc(body: DocusRootNode, options: Toc): Toc {
  const toc = generateFlatToc(body, options)
  toc.links = nestHeaders(toc.links)
  return toc
}
