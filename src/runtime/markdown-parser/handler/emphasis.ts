import { type State } from 'mdast-util-to-hast'
import { type Element, type Properties } from 'hast'
import { type Emphasis } from 'mdast'

export default function emphasis (state: State, node: Emphasis & { attributes?: Properties }) {
  const result: Element = {
    type: 'element',
    tagName: 'em',
    properties: node.attributes || {},
    children: state.all(node)
  }
  state.patch(node, result)
  return state.applyData(node, result)
}
