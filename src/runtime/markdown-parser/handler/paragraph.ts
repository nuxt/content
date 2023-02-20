import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import { MdastContent } from 'mdast-util-to-hast/lib'
import { kebabCase } from 'scule'
import htmlTags from '../../utils/html-tags'
import { getTagName } from './utils'

type Node = MdastContent & {
  children: any[]
}

export default function paragraph (h: H, node: Node) {
  if (node.children && node.children[0] && node.children[0].type === 'html') {
    const tagName = kebabCase(getTagName(node.children[0].value) || 'div')
    // Unwrap if component
    if (!htmlTags.includes(tagName)) {
      return all(h, node)
    }
  }
  return h(node, 'p', all(h, node))
}
