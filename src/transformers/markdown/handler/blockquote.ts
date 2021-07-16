import type { H } from 'mdast-util-to-hast'
import { wrap } from 'mdast-util-to-hast/lib/wrap'
import { all } from 'mdast-util-to-hast/lib/traverse'

export default function blockquote(h: H, node: any) {
  return h(node, 'prose-blockquote', wrap(all(h, node), true))
}
