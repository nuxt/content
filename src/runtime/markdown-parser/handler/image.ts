import { type State } from 'mdast-util-to-hast'
import { type Element, type Properties } from 'hast'
import { type Image } from 'mdast'
import { normalizeUri } from 'micromark-util-sanitize-uri'

export default function image (state: State, node: Image & { attributes?: Properties }) {
  const properties: Properties = { ...node.attributes, src: normalizeUri(node.url) }

  if (node.alt !== null && node.alt !== undefined) {
    properties.alt = node.alt
  }

  if (node.title !== null && node.title !== undefined) {
    properties.title = node.title
  }

  const result: Element = { type: 'element', tagName: 'img', properties, children: [] }
  state.patch(node, result)
  return state.applyData(node, result)
}
