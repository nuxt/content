// import { u } from 'unist-builder'
import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import type { MdastContent } from 'mdast-util-to-hast/lib'

type Node = MdastContent & {
  tagName: string
  checked?: boolean
  spread?: boolean
  children?: Node[]
}

export default function listItem (h: H, node: Node, parent: Node) {
  const result = all(h, node)
  const loose = parent ? listLoose(parent) : listItemLoose(node)
  const props: any = {}
  let wrapped: any[] = []
  let index
  let child

  if (typeof node.checked === 'boolean') {
    result.unshift(
      h({} as any, 'input', {
        type: 'checkbox',
        checked: node.checked,
        disabled: true
      })
    )

    // According to github-markdown-css, this class hides bullet.
    // See: <https://github.com/sindresorhus/github-markdown-css>.
    props.className = ['task-list-item']
  }

  const length = result.length
  index = -1

  while (++index < length) {
    child = result[index] as Node

    if (child.tagName === 'p' && !loose) {
      wrapped = wrapped.concat(child.children || [])
    } else {
      wrapped.push(child)
    }
  }

  return h(node, 'li', props, wrapped)
}

function listLoose (node: Node) {
  let loose = node.spread
  const children = node.children as Node[]
  const length = children.length
  let index = -1

  while (!loose && ++index < length) {
    loose = listItemLoose(children[index])
  }

  return loose
}

function listItemLoose (node: Node) {
  const spread = node.spread
  const children = (node.children || []) as Node[]
  return spread === undefined || spread === null ? children.length > 1 : spread
}
