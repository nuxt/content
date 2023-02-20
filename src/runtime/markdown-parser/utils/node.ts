import type { VNode } from 'vue'
import { MarkdownNode } from '../../types'

/**
 * List of text nodes
 */
export const TEXT_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']

/**
 * Check virtual node's tag
 * @param vnode Virtuel node from Vue virtual DOM
 * @param tag tag name
 * @returns `true` it the virtual node match the tag
 */
export function isTag (vnode: VNode | MarkdownNode, tag: string | symbol): boolean {
  // Vue 3 uses `type` instead of `tag`
  if (vnode.type === tag) {
    return true
  }
  // Vue 3 VNode `type` can be an object (tag is provided by ContentRendererMarkdown)
  if (typeof vnode.type === 'object' && (vnode.type as any).tag === tag) {
    return true
  }
  // Markdown node
  if ((vnode as MarkdownNode).tag === tag) {
    return true
  }
  return false
}

/**
 * Check if virtual node is text node
 */
export function isText (vnode: VNode | MarkdownNode): boolean {
  return isTag(vnode, 'text') || typeof vnode.children === 'string'
}

/**
 * Find children of a virtual node
 * @param vnode Virtuel node from Vue virtual DOM
 * @returns Children of given node
 */
export function nodeChildren (node: VNode | MarkdownNode) {
  if (Array.isArray(node.children) || typeof node.children === 'string') {
    return node.children
  }
  // Vue3 VNode children
  if (typeof node.children?.default === 'function') {
    return node.children.default()
  }
  return []
}

/**
 * Calculate text content of a virtual node
 * @param vnode Virtuel node from Vue virtual DOM
 * @returns text content of given node
 */
export function nodeTextContent (node: VNode | MarkdownNode): string {
  // Return empty string is vnode is falsy
  if (!node) { return '' }

  if (Array.isArray(node)) {
    return node.map(nodeTextContent).join('')
  }

  if (isText(node)) {
    return node.children as string || (node as MarkdownNode).value!
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
export function unwrap (vnode: VNode, tags = ['p']): VNode | VNode[] {
  if (Array.isArray(vnode)) {
    return vnode.flatMap(node => unwrap(node, tags))
  }

  let result: VNode | VNode[] = vnode

  // unwrap children
  if (tags.some(tag => tag === '*' || isTag(vnode, tag))) {
    result = nodeChildren(vnode) || vnode
    if (!Array.isArray(result) && TEXT_TAGS.some(tag => isTag(vnode, tag))) {
      result = [result]
    }
  }

  return result
}

export function flatUnwrap (vnodes: VNode | VNode[], tags = ['p']): VNode[] {
  vnodes = Array.isArray(vnodes) ? vnodes : [vnodes]

  if (!tags.length) {
    return vnodes
  }

  return vnodes
    .flatMap(vnode => flatUnwrap(unwrap(vnode, [tags[0]]), tags.slice(1)))
    .filter(vnode => !(isText(vnode) && nodeTextContent(vnode).trim() === ''))
}
