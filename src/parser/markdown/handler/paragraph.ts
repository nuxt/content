import { Node } from 'unist'
import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast/lib/traverse'
import htmlTags from 'html-tags'
import { kebabCase } from 'scule'
import { getTagName } from './utils'

export default function paragraph(h: H, node: Node) {
  if (node.children && node.children[0] && node.children[0].type === 'html') {
    const tagName = kebabCase(getTagName(node.children[0].value))
    // Unwrap if component
    if (!htmlTags.includes(tagName)) {
      return all(h, node)
    }
  }
  return h(node, 'prose-paragraph', all(h, node))
}
