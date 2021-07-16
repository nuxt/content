import { Node } from 'unist'
import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast/lib/traverse'

export default function heading(h: H, node: Node) {
  return h(node, 'prose-h' + (node as any).depth, all(h, node))
}
