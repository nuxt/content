import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import type { MdastNode } from 'mdast-util-to-hast/lib'

export default function heading(h: H, node: MdastNode) {
  return h(node, 'prose-h' + (node as any).depth, all(h, node))
}
