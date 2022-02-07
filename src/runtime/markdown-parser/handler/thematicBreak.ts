import type { H } from 'mdast-util-to-hast'
import type { MdastNode } from 'mdast-util-to-hast/lib'

export default function thematicBreak (h: H, node: MdastNode) {
  return h(node, 'hr')
}
