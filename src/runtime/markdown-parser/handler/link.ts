// import { join } from 'path'
// import fs from 'fs'
import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import { encode } from 'mdurl'
import type { MdastContent } from 'mdast-util-to-hast/lib'
import { isRelative } from 'ufo'
import { generatePath } from '../../transformers/path-meta'

type Node = MdastContent & {
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
  const match = link.match(/#.+$/)
  const hash = match ? match[0] : ''
  if (link.replace(/#.+$/, '').endsWith('.md') && (isRelative(link) || (!/^https?/.test(link) && !link.startsWith('/')))) {
    return (generatePath(link.replace('.md' + hash, ''), { forceLeadingSlash: false }) + hash)
  } else {
    return link
  }
}
