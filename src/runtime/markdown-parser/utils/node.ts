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
export function isTag (vnode: any, tag: string | symbol): boolean {
  // Vue 3 uses `type` instead of `tag`
  if (vnode.type === tag) {
    return true
  }

  // Vue3 VNode (tag is provided by ContentRendererMarkdown)
  if (typeof vnode.type === 'object' && vnode.type.tag === tag) {
    return true
  }
  // Classic VNode
  if (vnode.tag === tag) {
    return true
  }
  // Component Options
  if (vnode.componentOptions && vnode.componentOptions.tag === tag) {
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
  if (typeof node.children.default === 'function') {
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
    return node.children as string || (node as MarkdownNode).value
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
export function unwrap (vnode: any, tags = ['p']): any | any[] {
  if (Array.isArray(vnode)) {
    return vnode.flatMap(node => unwrap(node, tags))
  }

  let result = vnode

  // unwrap children
  if (tags.some(tag => tag === '*' || isTag(vnode, tag))) {
    result = nodeChildren(vnode) || vnode
    if (TEXT_TAGS.some(tag => isTag(vnode, tag))) {
      result = [result]
    }
  }

  return result
}

export function flatUnwrap (vnodes: any[] | any, tags = ['p']) {
  if (!tags.length) {
    return vnodes
  }

  return (Array.isArray(vnodes) ? vnodes : [vnodes])
    .flatMap(vnode => flatUnwrap(unwrap(vnode, [tags[0]]), tags.slice(1)))
    .filter(vnode => !(isText(vnode) && nodeTextContent(vnode).trim() === ''))
}
