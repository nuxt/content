import type { MDCComment, MDCElement, MDCRoot, MDCText } from '@nuxtjs/mdc'
import type { MinimalTree, MinimalNode, MinimalElement } from '@nuxt/content'

export function compressTree(input: MDCRoot): MinimalTree {
  return {
    type: 'minimal',
    value: input.children.map(compressNode).filter(v => v !== undefined) as MinimalNode[],
  }
}

export function decompressTree(input: MinimalTree): MDCRoot {
  return {
    type: 'root',
    children: input.value.map(decompressNode),
  }
}

function decompressNode(input: MinimalNode): MDCElement | MDCText {
  if (typeof input === 'string') {
    return {
      type: 'text',
      value: input,
    }
  }

  const [tag, props, ...children] = input as MinimalElement
  return {
    type: 'element',
    tag,
    props,
    children: children.map(decompressNode),
  }
}

function compressNode(input: MDCElement | MDCText | MDCComment): MinimalNode | undefined {
  if (input.type === 'comment') {
    return undefined
  }
  if (input.type === 'text') {
    return input.value
  }

  // remove empty class
  if (input.tag === 'code' && input.props?.className && input.props.className.length === 0) {
    delete input.props.className
  }

  return [
    input.tag,
    input.props || {},
    ...input.children.map(compressNode).filter(v => v !== undefined),
  ]
}

export function visit(tree: MinimalTree, checker: (node: MinimalNode) => boolean, visitor: (node: MinimalNode) => MinimalNode | undefined) {
  function walk(node: MinimalNode, parent: MinimalElement | MinimalNode[], index: number) {
    if (checker(node)) {
      const res = visitor(node)
      if (res !== undefined) {
        parent[index] = res
      }
    }
    if (Array.isArray(node) && node.length > 2) {
      for (let i = 2; i < node.length; i++) {
        walk(node[i] as MinimalNode, node, i)
      }
    }
  }

  tree.value.forEach((node, i) => {
    walk(node, tree.value, i)
  })
}
