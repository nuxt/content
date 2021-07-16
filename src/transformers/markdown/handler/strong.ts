import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast/lib/traverse'

export default function strong(h: H, node: any) {
  return h(node, 'prose-strong', node.attributes, all(h, node))
}
