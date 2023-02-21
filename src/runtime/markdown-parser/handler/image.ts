import type { H } from 'mdast-util-to-hast'
import { encode } from 'mdurl'
import type { MdastContent } from 'mdast-util-to-hast/lib'

type Node = MdastContent & {
  url: string
  alt: string
  title: string
  attributes?: any
}

export default function image (h: H, node: Node) {
  const props: any = {
    ...node.attributes,
    src: encode(node.url),
    alt: node.alt
  }

  if (node.title !== null && node.title !== undefined) {
    props.title = node.title
  }

  return h(node, 'img', props)
}
