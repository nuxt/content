import { join } from 'path'
import fs from 'fs'
import normalize from 'mdurl/encode'
import { Node } from 'unist'
import type { H } from 'mdast-util-to-hast'
import { all } from 'mdast-util-to-hast/lib/traverse'

export default function link(h: H, node: Node) {
  const props: any = {
    ...((node.attributes || {}) as object),
    href: normalize(node.url)
  }

  if (props.href.startsWith('/') && !props.href.startsWith('//') && props.href.match(/\.[a-z0-9A-Z]{2,4}$/)) {
    if (fs.existsSync(join(process.env.NUXT_STATIC_DIR, props.href))) {
      props.static = true
    }
  }

  if (node.title !== null && node.title !== undefined) {
    props.title = node.title
  }

  return h(node, 'prose-a', props, all(h, node))
}
