import type { H } from 'mdast-util-to-hast'
import { handlers } from 'mdast-util-to-hast/lib/handlers'
import { kebabCase } from 'scule'
import { getTagName } from './utils'

export default function html(h: H, node: any) {
  const tagName = getTagName(node.value)

  if (tagName) {
    node.value = node.value.replace(tagName, kebabCase(tagName))
  }

  return handlers.html(h, node)
}
