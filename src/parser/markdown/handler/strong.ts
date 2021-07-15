import { all } from 'mdast-util-to-hast/lib/traverse'

export default function strong(h, node) {
  return h(node, 'prose-strong', node.attributes, all(h, node))
}
