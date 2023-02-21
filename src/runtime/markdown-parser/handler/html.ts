import type { H } from 'mdast-util-to-hast'
import { kebabCase } from 'scule'
import { u } from 'unist-builder'
import type { MdastContent } from 'mdast-util-to-hast/lib'
import { getTagName } from './utils'

type Node = MdastContent & {
  value: string
}

export default function html (h: H, node: Node) {
  const tagName = getTagName(node.value)

  if (tagName && /[A-Z]/.test(tagName)) {
    node.value = node.value.replace(tagName, kebabCase(tagName))
  }

  // Html `<code>` tags should parse and render as inline code
  if (tagName === 'code') {
    node.value = node.value.replace(tagName, 'code-inline')
  }

  return h.dangerous ? h.augment(node, u('raw', node.value)) : null
}
