import { type State } from 'mdast-util-to-hast'
import { type Element, type Text } from 'hast'
import { type InlineCode } from 'mdast'

export default function inlineCode (state: State, node: InlineCode & { attributes: any }) {
  const text: Text = { type: 'text', value: node.value.replace(/\r?\n|\r/g, ' ') }
  state.patch(node, text)

  const result: Element = {
    type: 'element',
    tagName: 'code',
    properties: node.attributes,
    children: [text]
  }
  state.patch(node, result)
  return state.applyData(node, result)
}
