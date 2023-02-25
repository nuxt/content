import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import type { MdastContent } from 'mdast-util-to-hast/lib'
import { wrap } from './utils'

type Node = MdastContent & {
  ordered?: boolean
  start?: number,
  checked?: boolean
  children: Node[]
}

export default function list (h: H, node: Node) {
  const props: any = {}
  const name = `${node.ordered ? 'ol' : 'ul'}`

  if (typeof node.start === 'number' && node.start !== 1) {
    props.start = node.start
  }

  // Add class for task list. See: https://github.com/remarkjs/remark-gfm#use
  if ((node.children || []).some(child => typeof child.checked === 'boolean')) {
    props.className = ['contains-task-list']
  }

  return h(node, name, props, wrap(all(h, node), true))
}
