import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import { wrap } from './utils'

export default function blockquote(h: H, node: any) {
  return h(node, 'prose-blockquote', wrap(all(h, node), true))
}
