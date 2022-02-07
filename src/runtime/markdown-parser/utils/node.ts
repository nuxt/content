import type { VNode } from 'vue'
import { getContext } from 'unctx'
import { MarkdownNode } from '../../types'

const ctx = getContext<Record<string, string>>('mdc_tags')
ctx.set({}, true)
export const useTagsMap = () => ctx.use()!
export const setTagsMap = (map: Record<string, string>) => ctx.set(map, true)

export const expandTags = (_tags: string[], tagMap: Record<string, string> = useTagsMap()): string[] =>
  _tags.map(t => tagMap[t] || t)

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
export function isTag (vnode: any, tag: string): boolean {
  // Vue3 VNode
  if (vnode.type === tag) {
    return true
  }
  if (vnode.tag === tag) {
    return true
  }
  if (vnode.componentOptions && vnode.componentOptions.tag === tag) {
    return true
  }
  if (vnode.asyncMeta && vnode.asyncMeta.tag === tag) {
    return true
  }
  return false
}

/**
 * Find children of a virtual node
 * @param vnode Virtuel node from Vue virtual DOM
 * @returns Children of given node
 */
export function nodeChildren (node: VNode | MarkdownNode) {
  if (node.children) {
    return node.children
  }
  // TODO: Fix for Vue 3
  // if ((node as VNode).componentOptions && (node as VNode).componentOptions!.children) {
  //   return (node as VNode).componentOptions!.children
  // }
  if ((node as any).asyncMeta && (node as any).asyncMeta.children) {
    return (node as any).asyncMeta.children
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

  // Check for text markdown node
  if ((node as MarkdownNode).type === 'text') {
    return (node as MarkdownNode).value!
  }

  // TODO: Fix for Vue 3
  // Check for text vnode
  // if ((node as VNode).text) {
  //   return (node as VNode).text!
  // }

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

export function flatUnwrap (vnodes: any[] | any, tags = ['p']) {
  return (
    (Array.isArray(vnodes) ? vnodes : [vnodes])
      .flatMap(vnode => unwrap(vnode, tags))
      // second step unwrap for inner tags like li
      .flatMap(vnode => unwrap(vnode, tags))
      // trim new lines
      .filter(vnode => !vnode.text || !!vnode.text.trim())
  )
}
