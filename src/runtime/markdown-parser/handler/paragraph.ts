import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import { kebabCase } from 'scule'
import htmlTags from '../../utils/html-tags'
import { getTagName } from './utils'

export default function paragraph (h: H, node: any) {
  if (node.children && node.children[0] && node.children[0].type === 'html') {
    const tagName = kebabCase(getTagName(node.children[0].value) || 'div')
    // Unwrap if component
    if (!htmlTags.includes(tagName)) {
      return all(h, node)
    }
  }
  return h(node, 'p', all(h, node))
}
