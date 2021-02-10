/**
 * Parses nodes for JSON structure. Attempts to drop
 * unwanted properties.
 */
function parseAsJSON (node, parent) {
  /**
   * Element node creates an isolated children array to
   * allow nested elements
   */
  if (node.type === 'element') {
    const childs = []

    /**
     * Replace a tag with nuxt-link if relative
     */
    if (node.tagName === 'a' && (node.properties.href || '').startsWith('/')) {
      node.tagName = 'nuxt-link'
      node.properties.to = node.properties.href
      delete node.properties.href
    }

    const filtered = {
      type: 'element',
      tag: node.tagName,
      props: node.properties,
      children: childs
    }

    // Unwrap contents of the template, saving the root level inside content.
    if (node.tagName === 'template') {
      const templateContent = []
      node.content.children.forEach(templateNode => parseAsJSON(templateNode, templateContent))
      filtered.content = templateContent
    }

    parent.push(filtered)

    if (node.children) {
      node.children.forEach(child => parseAsJSON(child, childs))
    }

    return
  }

  /**
   * Text node pushes to the parent
   */
  if (node.type === 'text') {
    parent.push({
      type: 'text',
      value: node.value
    })
    return
  }

  /**
   * Root level nodes push to the original parent
   * children and doesn't create a new node
   */
  if (node.type === 'root') {
    node.children.forEach(child => parseAsJSON(child, parent))
  }
}

/**
 * JSON compiler
 */
module.exports = function () {
  this.Compiler = function (root) {
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
