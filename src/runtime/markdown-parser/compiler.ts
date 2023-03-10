import { Node as UnistNode } from 'unist'
import type { MarkdownRoot, MarkdownNode, MarkdownOptions } from '../types'

type Node = UnistNode & {
  tagName?: string
  value?: string
  children?: Node[]
  properties: Record<string, any>
}

/**
 * JSON compiler
 */
export default function (this: any, _options: MarkdownOptions) {
  /**
   * Parses nodes for JSON structure. Attempts to drop
   * unwanted properties.
   */
  function parseAsJSON (node: Node | Node[]): MarkdownNode | MarkdownNode[] | undefined {
    if (Array.isArray(node)) {
      return node.map(parseAsJSON).filter(Boolean) as MarkdownNode[]
    }

    // Remove double dashes and trailing dash from heading ids
    // Insert underscore if id start with a digit
    if (node.tagName?.startsWith('h') && node.properties.id) {
      node.properties.id = node.properties.id
        .replace(/-+/g, '-')
        .replace(/-$/, '')
        .replace(/^-/, '')
        .replace(/^(\d)/, '_$1')
    }

    /**
     * Element node creates an isolated children array to
     * allow nested elements
     */
    if (node.type === 'element') {
      if (node.tagName === 'li') {
        // unwrap unwanted paragraphs around `<li>` children
        let hasPreviousParagraph = false
        node.children = node.children?.flatMap((child) => {
          if (child.tagName === 'p') {
            if (hasPreviousParagraph) {
              // Insert line break before new paragraph
              child.children!.unshift({
                type: 'element',
                tagName: 'br',
                properties: {}
              })
            }

            hasPreviousParagraph = true
            return child.children
          }
          return child
        }) as Node[]
      }

      /**
       * Rename component slots tags name
       */
      if (node.tagName === 'component-slot') {
        node.tagName = 'template'
      }

      return <MarkdownNode> {
        type: 'element',
        tag: node.tagName as string,
        props: node.properties,
        children: parseAsJSON(node.children || [])
      }
    }

    /**
     * Text node
     */
    if (node.type === 'text') {
      // Remove new line nodes
      if (node.value === '\n') {
        return undefined
      }
      return <MarkdownNode> {
        type: 'text',
        value: node.value as string
      }
    }

    // Remove comment nodes from AST tree
    if (node.type === 'comment') {
      return undefined
    }

    node.children = parseAsJSON(node.children || []) as Node[]

    return node as MarkdownNode
  }

  this.Compiler = function (root: Node): MarkdownRoot {
    /**
     * We do not use `map` operation, since each node can be expanded to multiple top level
     * nodes. Instead, we need a array to fill in as many elements inside a single
     * iteration
     */
    return {
      type: 'root',
      children: parseAsJSON(root.children || []) as MarkdownNode[]
    }
  }
}
