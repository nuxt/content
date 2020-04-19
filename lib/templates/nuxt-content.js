function propsToAttrs (props) {
  return Object.keys(props).reduce(function (result, key) {
    if (key === 'className') {
      result.class = props.className.join(' ')
    } else if (key.indexOf('data') === 0) {
      result[key.replace(/[A-Z]/g, (g) => `-${g.toLowerCase()}`)] = props[key]
    } else {
      result[key] = props[key]
    }
    return result
  }, {})
}

function processNode (node, createElement) {
  /**
   * Return raw value as it is
   */
  if (node.type === 'text') {
    return node.value
  }

  return createElement(node.tag, { attrs: propsToAttrs(node.props) }, node.children.map(function (child) {
    return processNode(child, createElement)
  }))
}

export default {
  name: 'NuxtContent',
  functional: true,
  props: {
    body: {
      required: true,
      validator (value) {
        return value && value.children && Array.isArray(value.children)
      }
    }
  },

  render (createElement, { props }) {
    if (!props.body || !props.body.children || !Array.isArray(props.body.children)) {
      return
    }
    return processNode({
      tag: 'div',
      props: {
        className: ['nuxt-content'],
        ...props.body.props
      },
      children: props.body.children
    }, createElement)
  }
}
