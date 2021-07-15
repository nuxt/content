import { Node } from 'unist'
import { DocusRootNode, DocusMarkdownNode } from '../../../types'

/**
 * Parses nodes for JSON structure. Attempts to drop
 * unwanted properties.
 */
function parseAsJSON(node: Node, parent: DocusMarkdownNode[]) {
  /**
   * Element node creates an isolated children array to
   * allow nested elements
   */
  if (node.type === 'element') {
    const childs = []

    if (node.tagName === 'prose-li') {
      // unwrap unwanted paragraphs around `<li>` children
      let hasPreviousParagraph = false
      node.children = (node.children as Node[]).flatMap(child => {
        if (child.tagName === 'prose-paragraph') {
          if (hasPreviousParagraph) {
            // Insert line break before new paragraph
            ;(child.children as Node[]).unshift({
              type: 'element',
              tagName: 'br',
              properties: {}
            })
          }

          hasPreviousParagraph = true
          return child.children
        }
        return child
      })
    }

    /**
     * rename directive slots tags name
     */
    if (node.tagName === 'directive-slot') {
      node.tagName = 'template'
      node.content = { ...node }
    }

    /**
     * Replace a tag with nuxt-link if relative
     */
    if (node.tagName === 'a') {
      const properties = node.properties as any
      if ((properties.href || '').startsWith('/')) {
        node.tagName = 'nuxt-link'
        properties.to = properties.href
        delete properties.href
      }
    }

    const filtered: DocusMarkdownNode = {
      type: 'element',
      tag: node.tagName as string,
      props: node.properties,
      children: childs
    }

    // Unwrap contents of the template, saving the root level inside content.
    if (node.tagName === 'template') {
      const children = (node.content as Node).children as Node[]
      const templateContent = []
      children.forEach(templateNode => parseAsJSON(templateNode, templateContent))
      filtered.content = templateContent
    }

    parent.push(filtered)

    if (node.children) {
      ;(node.children as Node[]).forEach(child => parseAsJSON(child, childs))
    }

    return
  }

  /**
   * Text node pushes to the parent
   */
  if (node.type === 'text') {
    parent.push({
      type: 'text',
      value: node.value as string
    })
    return
  }

  /**
   * Root level nodes push to the original parent
   * children and doesn't create a new node
   */
  if (node.type === 'root') {
    ;(node.children as Node[]).forEach(child => parseAsJSON(child, parent))
  }
}

/**
 * JSON compiler
 */
export default function () {
  this.Compiler = function (root): DocusRootNode {
    /**
     * We do not use `map` operation, since each node can be expanded to multiple top level
     * nodes. Instead, we need a array to fill in as many elements inside a single
     * iteration
     */
    const result = []
    parseAsJSON(root, result)

    return {
      type: 'root',
      children: result
    }
  }
}
