const rootKeys = ['className', 'class', 'style']

function propsToData (props, doc) {
  return Object.keys(props).reduce(function (data, key) {
    const k = key.replace(/.*:/, '')
    const obj = rootKeys.includes(k) ? data : data.attrs
    const value = props[key]
    if (key === 'className') {
      obj.class = props.className.join(' ')
    } else if (key.indexOf('data') === 0) {
      obj[key.replace(/[A-Z]/g, (g) => `-${g.toLowerCase()}`)] = value
    } else if (key === 'v-bind') {
      let val = doc[value]
      if (!val) {
        val = eval(`(${value})`)
      }
      obj = Object.assign(obj, val)
    } else if (key.indexOf(':') === 0 || key.indexOf('v-bind:') === 0) {
      key = key.replace('v-bind:', '').replace(':', '')
      if (doc[value]) {
        obj[key] = doc[value]
      } else {
        obj[key] = eval(`(${value})`)
      }
    } else {
      obj[key] = value
    }
    return data
  }, { attrs: {} })
}

function processNode (node, h, doc) {
  /**
   * Return raw value as it is
   */
  if (node.type === 'text') {
    return node.value
  }

  return h(node.tag, propsToData(node.props, doc), node.children.map((child) => processNode(child, h, doc)))
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
