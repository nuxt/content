import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import type { MdastContent } from 'mdast-util-to-hast/lib'

export default function heading (h: H, node: MdastContent) {
  return h(node, 'h' + (node as any).depth, all(h, node))
}
