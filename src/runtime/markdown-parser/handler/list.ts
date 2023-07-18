import { type State } from 'mdast-util-to-hast'
import { type Element, type Properties } from 'hast'
import { type List } from 'mdast'

export default function list (state: State, node: List) {
  const properties: Properties = {}
  const results = state.all(node)
  let index = -1

  if (typeof node.start === 'number' && node.start !== 1) {
    properties.start = node.start
  }

  // Like GitHub, add a class for custom styling.
  while (++index < results.length) {
    const child = results[index]

    if (
      child.type === 'element' &&
      child.tagName === 'li' &&
      child.properties &&
      Array.isArray(child.properties.className) &&
      child.properties.className.includes('task-list-item')
    ) {
      properties.className = ['contains-task-list']
      break
    }
  }

  // Add class for task list. See: https://github.com/remarkjs/remark-gfm#use
  if ((node.children || []).some(child => typeof child.checked === 'boolean')) {
    properties.className = ['contains-task-list']
  }

  const result: Element = {
    type: 'element',
    tagName: node.ordered ? 'ol' : 'ul',
    properties,
    children: state.wrap(results, true)
  }
  state.patch(node, result)
  return state.applyData(node, result)
}
