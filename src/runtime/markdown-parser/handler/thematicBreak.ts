import type { H } from 'mdast-util-to-hast'
import type { MdastContent } from 'mdast-util-to-hast/lib'

export default function thematicBreak (h: H, node: MdastContent) {
  return h(node, 'hr')
}
