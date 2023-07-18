import { type State } from 'mdast-util-to-hast'
import { type Element, type Properties } from 'hast'
import { type Heading } from 'mdast'

export default function heading (state: State, node: Heading & { attributes?: Properties }) {
  const result: Element = {
    type: 'element',
    tagName: 'h' + node.depth,
    properties: node.attributes || {},
    children: state.all(node)
  }
  state.patch(node, result)
  return state.applyData(node, result)
}
