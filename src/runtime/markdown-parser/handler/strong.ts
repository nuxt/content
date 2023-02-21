import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import { MdastContent } from 'mdast-util-to-hast/lib'

type Node = MdastContent & {
  attributes?: any
}

export default function strong (h: H, node: Node) {
  return h(node, 'strong', node.attributes, all(h, node))
}
