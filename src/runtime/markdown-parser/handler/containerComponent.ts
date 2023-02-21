import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import type { MdastContent } from 'mdast-util-to-hast/lib'

type Node = MdastContent & {
  tagName: string
  attributes?: any
  fmAttributes?: any
}

export default function containerComponent (h: H, node: Node) {
  const hast: any = h(node, node.tagName, node.attributes, all(h, node))

  // Inline attributes that passed in MDC sysntax `:component{...attributes}`
  hast.attributes = node.attributes

  // Attributes define using FrontMatter syntax and YAML format
  hast.fmAttributes = node.fmAttributes

  return hast
}
