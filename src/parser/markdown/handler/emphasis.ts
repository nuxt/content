import { all } from 'mdast-util-to-hast/lib/traverse'

export default function emphasis(h, node) {
  return h(node, 'prose-em', node.attributes, all(h, node))
}
