import { type State } from 'mdast-util-to-hast'
import { type Element, type Properties } from 'hast'
import { type Strong } from 'mdast'

export default function strong (state: State, node: Strong & { attributes?: Properties }) {
  const result: Element = {
    type: 'element',
    tagName: 'strong',
    properties: node.attributes || {},
    children: state.all(node)
  }
  state.patch(node, result)
  return state.applyData(node, result)
}
