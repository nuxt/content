import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'

export default function strong (h: H, node: any) {
  return h(node, 'strong', node.attributes, all(h, node))
}
