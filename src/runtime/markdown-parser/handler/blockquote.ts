import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import type { MdastContent } from 'mdast-util-to-hast/lib'
import { wrap } from './utils'

export default function blockquote (h: H, node: MdastContent) {
  return h(node, 'blockquote', wrap(all(h, node), true))
}
