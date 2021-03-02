import info from 'property-information'

const rootKeys = ['class-name', 'class', 'style']

const rxOn = /^@|^v-on:/
const rxBind = /^:|^v-bind:/
const rxModel = /^v-model/
const nativeInputs = ['select', 'textarea', 'input']

function evalInContext (code, context) {
  return new Function("with(this) { return (" + code + ") }").call(context)
}

function propsToData (node, doc) {
  const { tag, props } = node
  return Object.keys(props).reduce(function (data, key) {
    const k = key.replace(/.*:/, '')
    let obj = rootKeys.includes(k) ? data : data.attrs
    const value = props[key]
    const { attribute } = info.find(info.html, key)
    const native = nativeInputs.includes(tag)

    if (rxModel.test(key) && value in doc && !native) {
      const mods = key.replace(rxModel, '')
        .split('.')
        .filter(d => d)
        .reduce((d, k) => (d[k] = true, d), {})

      // As of yet we don't resolve custom v-model field/event names from components
      const field = 'value'
      const event = mods.lazy ? 'change' : 'input'
      const processor =
        mods.number ? (d => +d) :
        mods.trim ? (d => d.trim()) :
        d => d

      obj[field] = evalInContext(value, doc)
      data.on = data.on || {}
      data.on[event] = e => doc[value] = processor(e)
    } else if (key === 'v-bind') {
      const val = value in doc ? doc[value] : evalInContext(value, doc)
      obj = Object.assign(obj, val)
    } else if (rxOn.test(key)) {
      key = key.replace(rxOn, '')
      data.on = data.on || {}
      data.on[key] = evalInContext(value, doc)
    } else if (rxBind.test(key)) {
      key = key.replace(rxBind, '')
      obj[key] = value in doc ? doc[value] : evalInContext(value, doc)
    } else if (Array.isArray(value)) {
      obj[attribute] = value.join(' ')
    } else {
      obj[attribute] = value
    }
    return data
  }, { attrs: {} })
}

/**
 * Create the scoped slots from `node` template children. Templates for default
 * slots are processed as regular children in `processNode`.
 */
function slotsToData (node, h, doc) {
  const data = {}
  const children = node.children || []

  children.forEach((child) => {
    // Regular children and default templates are processed inside `processNode`.
    if (!isTemplate(child) || isDefaultTemplate(child)) { return }

    // Non-default templates are converted into slots.
    data.scopedSlots = data.scopedSlots || {}
    const template = child
    const name = getSlotName(template)
    const vDomTree = template.content.map(tmplNode => processNode(tmplNode, h, doc))
    data.scopedSlots[name] = function () { return vDomTree }
  })

  return data
}

function processNode (node, h, doc) {
  /**
   * Return raw value as it is
   */
  if (node.type === 'text') {
    return node.value
  }

  const slotData = slotsToData(node || {}, h, doc)
  const propData = propsToData(node || {}, doc)
  const data = Object.assign({}, slotData, propData)

  /**
   * Process child nodes, flat-mapping templates pointing to default slots.
   */
  const children = []
  for (const child of node.children) {
    // Template nodes pointing to non-default slots are processed inside `slotsToData`.
    if (isTemplate(child) && !isDefaultTemplate(child)) { continue }

    const processQueue = isDefaultTemplate(child) ? child.content : [child]
    children.push(...processQueue.map(node => processNode(node, h, doc)))
  }

  return h(node.tag, data, children)
}

const DEFAULT_SLOT = 'default'

function isDefaultTemplate (node) {
  return isTemplate(node) && getSlotName(node) === DEFAULT_SLOT
}

function isTemplate (node) {
  return node.tag === 'template'
}

function getSlotName (node) {
  let name = ''
  for (const propName of Object.keys(node.props)) {
    if (!propName.startsWith('#') && !propName.startsWith('v-slot:')) { continue }
    name = propName.split(/[:#]/, 2)[1]
    break
  }
  return name || DEFAULT_SLOT
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
    let classes = []
    if (Array.isArray(data.class)) {
      classes = data.class
    } else if (typeof data.class === 'object') {
      const keys = Object.keys(data.class)
      classes = keys.filter(key => data.class[key])
    } else {
      classes = [data.class]
    }
    data.class = classes.concat('nuxt-content')
    data.props = Object.assign({ ...body.props }, data.props)
    return h('div', data, body.children.map(child => processNode(child, h, document)))
  }
}
