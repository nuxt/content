function propsToAttrs (props, doc) {
  return Object.keys(props).reduce(function (result, key) {
    const value = props[key]
    if (key === 'className') {
      result.class = props.className.join(' ')
    } else if (key.indexOf('data') === 0) {
      result[key.replace(/[A-Z]/g, (g) => `-${g.toLowerCase()}`)] = value
    } else if (key === 'v-bind') {
      let val = doc[value]
      if (!val && (value[0] === '{' || value[0] === '[')) {
        val = eval(`(${value})`)
      }
      result = Object.assign(result, val)
    } else if (key.indexOf(':') === 0 || key.indexOf('v-bind:') === 0) {
      key = key.replace('v-bind:', '').replace(':', '')
      if (value[0] === '{' || value[0] === '[') {
        result[key] = eval(`(${value})`)
      } else {
        result[key] = doc[value]
      }
    } else {
      result[key] = value
    }
    return result
  }, {})
}

function processNode (node, h, doc) {
  /**
   * Return raw value as it is
   */
  if (node.type === 'text') {
    return node.value
  }

  return h(node.tag, { attrs: propsToAttrs(node.props, doc) }, node.children.map((child) => processNode(child, h, doc)))
}

export default {
  name: 'NuxtContent',
  functional: true,
  props: {
    document: {
      required: true
    }
  },

  render (h, { data, props }) {
    const { document } = props
    const { body } = document || {}
    if (!body || !body.children || !Array.isArray(body.children)) {
      return
    }
    data.class = Object.assign({ 'nuxt-content': true }, data.class)
    data.props = Object.assign({ ...body.props }, data.props)
    return h('div', data, body.children.map((child) => processNode(child, h, document)))
  }
}
