import defu from 'defu'
import { MarkdownRoot } from '../types'
import { flatUnwrap, nodeTextContent } from './utils/node'

export function processHeading (body: MarkdownRoot) {
  let title = ''
  let description = ''
  const children = body.children
    // top level `text` can be ignored
    .filter(node => node.type !== 'text')

  if (children.length && children[0].tag === 'h1') {
    /**
     * Remove node
     */
    const node = children.shift()!

    /**
     * Remove anchor link from H1 tag
     */
    node.children = flatUnwrap(node.children, ['a'])

    /**
     * Generate title
     */
    title = nodeTextContent(node)

    /**
     * Inject class
     */
    node.props = defu(node.props || {}, {
      class: 'd-heading-title'
    })
  }

  if (children.length && children[0].tag === 'p') {
    /**
     * Remove node
     */
    const node = children.shift()!

    /**
     * Generate description
     */
    description = nodeTextContent(node)

    /**
     * Inject class
     */
    node.props = defu(node.props || {}, {
      class: 'd-heading-description'
    })
  }

  if (children.length && children[0].tag === 'hr') {
    /**
     * Remove node
     */
    const node = children.shift()!

    /**
     * Inject class
     */
    node.props = defu(node.props || {}, {
      class: 'd-heading-hr'
    })
  }

  return {
    title,
    description,
    body
  }
}
