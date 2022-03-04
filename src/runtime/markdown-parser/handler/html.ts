import type { H } from 'mdast-util-to-hast'
import { kebabCase } from 'scule'
import { u } from 'unist-builder'
import { getTagName } from './utils'

export default function html (h: H, node: any) {
  const tagName = getTagName(node.value)

  if (tagName) {
    node.value = node.value.replace(tagName, kebabCase(tagName))
  }

  // Html `<code>` tags should parse and render as inline code
  if (tagName === 'code') {
    node.value = node.value.replace(tagName, 'code-inline')
  }

  return h.dangerous ? h.augment(node, u('raw', node.value)) : null
}
