// import { join } from 'path'
// import fs from 'fs'
import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import { encode } from 'mdurl'
import type { MdastNode } from 'mdast-util-to-hast/lib'
import { isRelative } from 'ufo'

type Node = MdastNode & {
  title: string
  url: string
  attributes?: any
  tagName: string
  children?: Node[]
}

export default function link (h: H, node: Node) {
  const props: any = {
    ...((node.attributes || {}) as object),
    href: encode(normalizeLink(node.url))
  }

  if (node.title !== null && node.title !== undefined) {
    props.title = node.title
  }

  return h(node, 'a', props, all(h, node))
}

function normalizeLink (link: string) {
  if (isRelative(link) || (!/^https?/.test(link) && !link.startsWith('/'))) {
    return link.replace(/^(..?\/)?[0-9]*\./g, '$1').replace(/\.md$/g, '')
  } else {
    return link
  }
}
