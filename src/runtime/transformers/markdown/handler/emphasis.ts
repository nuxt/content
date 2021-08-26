import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'

export default function emphasis(h: H, node: any) {
  return h(node, 'prose-em', node.attributes, all(h, node))
}
