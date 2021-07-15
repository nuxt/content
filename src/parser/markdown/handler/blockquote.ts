import { wrap } from 'mdast-util-to-hast/lib/wrap'
import { all } from 'mdast-util-to-hast/lib/traverse'

export default function blockquote(h, node) {
  return h(node, 'prose-blockquote', wrap(all(h, node), true))
}
