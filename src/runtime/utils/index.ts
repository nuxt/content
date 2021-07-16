import { VNode } from 'vue'
import { DocusMarkdownNode } from '../../types'

/**
 * The map between html tags and equivalent tags in Docus
 *
 * !important: The second item in the tags list should be the prose component
 */
export const TAGS_MAP: { [key: string]: string[] } = {
  h1: ['h1', 'prose-h1'],
  h2: ['h2', 'prose-h2'],
  h3: ['h3', 'prose-h3'],
  h4: ['h4', 'prose-h4'],
  h5: ['h5', 'prose-h5'],
  h6: ['h6', 'prose-h6'],
  hr: ['hr', 'prose-hr'],
  p: ['p', 'prose-paragraph'],
  ul: ['ul', 'prose-ul'],
  ol: ['ol', 'prose-ol'],
  blockquote: ['blockquote', 'prose-blockquote'],
  img: ['img', 'prose-img'],
  a: ['a', 'prose-a'],
  code: ['code', 'prose-code-inline']
}

export const expandTags = (_tags: string[]): string[] => _tags.flatMap(t => TAGS_MAP[t])

/**
 * List of text nodes
 */
export const TEXT_TAGS = expandTags(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'])

/**
 * Check virtual node's tag
 * @param vnode Virtuel node from Vue virtual DOM
 * @param tag tag name
 * @returns `true` it the virtual node match the tag
 */
export function isTag(vnode: any, tag: string): boolean {
  return vnode?.tag === tag || vnode?.componentOptions?.tag === tag || vnode?.asyncMeta?.tag === tag
}

/**
 * Find children of a virtual node
 * @param vnode Virtuel node from Vue virtual DOM
 * @returns Children of given node
 */
export function nodeChildren(node: VNode | DocusMarkdownNode) {
  return node.children || (node as VNode)?.componentOptions?.children || (node as any)?.asyncMeta?.children
}

/**
 * Calculate text content of a virtual node
 * @param vnode Virtuel node from Vue virtual DOM
 * @returns text content of given node
 */
export function nodeTextContent(node: VNode | DocusMarkdownNode): string {
  // Return empty string is vnode is falsy
  if (!node) return ''

  if (Array.isArray(node)) {
    return node.map(nodeTextContent).join('')
  }

  // Check for text markdown node
  if ((node as DocusMarkdownNode).type === 'text') {
    return (node as DocusMarkdownNode).value!
  }

  // Check for text vnode
  if ((node as VNode).text) {
    return (node as VNode).text!
  }

  // Walk through node children
  const children = nodeChildren(node)
  if (Array.isArray(children)) {
    return children.map(nodeTextContent).join('')
  }

  // Return empty string for non-text nodes without any children
  return ''
}

/**
 * Unwrap tags within a virtual node
 * @param vnode Virtuel node from Vue virtual DOM
 * @param tags list of tags to unwrap
 * @returns
 */
export function unwrap(vnode: any, tags = ['p']): any | any[] {
  if (Array.isArray(vnode)) {
    return vnode.flatMap(node => unwrap(node, tags))
  }
  tags = expandTags(tags)
  let result = vnode

  // unwrapp children
  if (tags.some(tag => isTag(vnode, tag))) {
    result = nodeChildren(vnode) || vnode
    if (TEXT_TAGS.some(tag => isTag(vnode, tag))) {
      result = [result]
    }
  }

  return result
}

export function flatUnwrap(vnodes: any[] | any, tags = ['p']) {
  return (
    (Array.isArray(vnodes) ? vnodes : [vnodes])
      .flatMap(vnode => unwrap(vnode, tags))
      // second step unwrap for inner tags like li
      .flatMap(vnode => unwrap(vnode, tags))
      // trim new lines
      .filter(vnode => !vnode.text || !!vnode.text.trim())
  )
}
