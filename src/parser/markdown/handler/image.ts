import normalize from 'mdurl/encode.js'

/**
 * @type {Handler}
 * @param {Image} node
 */
export default function image(h, node) {
  const props: any = {
    ...node.attributes,
    src: normalize(node.url),
    alt: node.alt
  }

  if (node.title !== null && node.title !== undefined) {
    props.title = node.title
  }

  return h(node, 'prose-img', props)
}
