import type { H } from 'mdast-util-to-hast'
import { u } from 'unist-builder'

export default function inlineCode(h: H, node: any) {
  return h(node, 'prose-code-inline', node.attributes, [
    // @ts-ignore
    u('text', node.value.replace(/\r?\n|\r/g, ' '))
  ])
}
