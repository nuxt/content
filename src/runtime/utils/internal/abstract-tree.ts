import type { MDCComment, MDCElement, MDCRoot, MDCText } from '@nuxtjs/mdc'
import type { MinimalTree, MinimalNode } from '@nuxt/content'

export function compressTree(input: MDCRoot): MinimalTree {
  console.log(input.children)

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
