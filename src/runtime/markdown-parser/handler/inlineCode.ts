import type { H } from 'mdast-util-to-hast'
import { u } from 'unist-builder'
import type { MdastContent } from 'mdast-util-to-hast/lib'

type Node = MdastContent & {
  value: string
  attributes?: any
}

export default function inlineCode (h: H, node: Node) {
  return h(node, 'code-inline', node.attributes, [
    // @ts-ignore
    u('text', node.value.replace(/\r?\n|\r/g, ' '))
  ])
}
