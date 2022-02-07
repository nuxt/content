// import { join } from 'path'
// import fs from 'fs'
import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast'
import { encode } from 'mdurl'
import type { MdastNode } from 'mdast-util-to-hast/lib'

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
    href: encode(node.url)
  }

  // if (props.href.startsWith('/') && !props.href.startsWith('//') && props.href.match(/\.[a-z0-9A-Z]{2,4}$/)) {
  //   if (fs.existsSync(join(process.env.NUXT_STATIC_DIR || '', props.href))) {
  //     props.static = true
  //   }
  // }

  if (node.title !== null && node.title !== undefined) {
    props.title = node.title
  }

  return h(node, 'a', props, all(h, node))
}
