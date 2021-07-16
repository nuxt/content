import { wrap } from 'mdast-util-to-hast/lib/wrap'
import { Node } from 'unist'
import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast/lib/traverse'

export default function list(h: H, node: Node) {
  const props: any = {}
  const name = `prose-${node.ordered ? 'ol' : 'ul'}`

  if (typeof node.start === 'number' && node.start !== 1) {
    props.start = node.start
  }

  return h(node, name, props, wrap(all(h, node), true))
}
