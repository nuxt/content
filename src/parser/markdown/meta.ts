import defu from 'defu'
import { expandTags, flatUnwrap, nodeTextContent } from '../../runtime/utils'
import { DocusRootNode } from '../../../types'

export function processHeading(body: DocusRootNode) {
  let title = ''
  let description = ''
  const children = body.children
    // top level `text` can be ignored
    .filter(node => node.type !== 'text')

  if (children.length && expandTags(['h1']).includes(children[0].tag)) {
    /**
     * Remove node
     */
    const node = children.shift()

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
    node.props = defu(node.props, {
      class: 'd-heading-title'
    })
  }

  if (children.length && expandTags(['p']).includes(children[0].tag)) {
    /**
     * Remove node
     */
    const node = children.shift()

    /**
     * Generate description
     */
    description = nodeTextContent(node)

    /**
     * Inject class
     */
    node.props = defu(node.props, {
      class: 'd-heading-description'
    })
  }

  if (children.length && expandTags(['hr']).includes(children[0].tag)) {
    /**
     * Remove node
     */
    const node = children.shift()

    /**
     * Inject class
     */
    node.props = defu(node.props, {
      class: 'd-heading-hr'
    })
  }

  return {
    title,
    description,
    body
  }
}
