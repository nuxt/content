import type { Node } from 'unist'
import type { H } from 'mdast-util-to-hast'

export default function thematicBreak(h: H, node: Node) {
  return h(node, 'prose-hr')
}
