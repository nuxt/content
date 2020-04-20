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

function processNode (node, h) {
  /**
   * Return raw value as it is
   */
  if (node.type === 'text') {
    return node.value
  }

  return h(node.tag, { attrs: propsToAttrs(node.props) }, node.children.map((child) => processNode(child, h)))
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

  render (h, { data, props }) {
    if (!props.body || !props.body.children || !Array.isArray(props.body.children)) {
      return
    }
    data.class = Object.assign({ 'nuxt-content': true }, data.class)
    data.props = Object.assign({ ...props.body.props }, data.props)
    return h('div', data, props.body.children.map((child) => processNode(child, h)))
  }
}
