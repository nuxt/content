import { type State } from 'mdast-util-to-hast'
import { type Element } from 'hast'
import { type Paragraph } from 'mdast'
import { kebabCase } from 'scule'
import htmlTags from '../../utils/html-tags'
import { getTagName } from './utils'

export default function paragraph (state: State, node: Paragraph) {
  if (node.children && node.children[0] && node.children[0].type === 'html') {
    const tagName = kebabCase(getTagName(node.children[0].value) || 'div')
    // Unwrap if component
    if (!htmlTags.includes(tagName)) {
      return state.all(node)
    }
  }

  const result: Element = {
    type: 'element',
    tagName: 'p',
    properties: {},
    children: state.all(node)
  }
  state.patch(node, result)
  return state.applyData(node, result)
}
