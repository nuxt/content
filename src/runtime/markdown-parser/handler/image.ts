import type { H } from 'mdast-util-to-hast'
import { encode } from 'mdurl'

/**
 * @type {Handler}
 * @param {Image} node
 */
export default function image (h: H, node: any) {
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
