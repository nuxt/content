function processNode (node, createElement) {
  /**
   * Return raw value as it is
   */
  if (node.type === 'text') {
    return node.value
  }

  return createElement(node.tag, {}, node.children.map(function (child) {
    return processNode(child, createElement)
  }))
}

export default {
  name: 'MdContent',
  functional: true,
  props: {
    body: {
      required: true,
      validator (value) {
        return value && value.children && Array.isArray(value.children)
      }
    }
  },

  render (createElement, context) {
    return processNode({
      tag: 'div',
      props: context.props.body.props || {},
      children: context.props.body.children
    }, createElement)
  }
}
