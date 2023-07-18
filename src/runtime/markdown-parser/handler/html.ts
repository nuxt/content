import { type State, type Raw } from 'mdast-util-to-hast'
import { type Html } from 'mdast'
import { kebabCase } from 'scule'
import { getTagName } from './utils'

export default function html (state: State, node: Html) {
  const tagName = getTagName(node.value)

  if (tagName && /[A-Z]/.test(tagName)) {
    node.value = node.value.replace(tagName, kebabCase(tagName))
  }

  if ((state as any).dangerous || state.options?.allowDangerousHtml) {
    /** @type {Raw} */
    const result: Raw = { type: 'raw', value: node.value }
    state.patch(node, result)
    return state.applyData(node, result)
  }

  return undefined
}
