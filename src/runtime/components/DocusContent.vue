<script lang="ts">
import Vue from 'vue'
import { pascalCase } from 'scule'
import { find, html } from 'property-information'
import type { CreateElement, RenderContext, VNode } from 'vue'
import type { MDCNode } from '@docus/mdc'
import type { DocusDocument } from 'types'

// Root keys from a node
const rootKeys = ['class-name', 'class', 'className', 'style']

const rxOn = /^@|^v-on:/
const rxBind = /^:|^v-bind:/
const rxModel = /^v-model/
const nativeInputs = ['select', 'textarea', 'input']

// Model modifiers
const number = (d: any) => +d
const trim = (d: any) => d.trim()
const noop = (d: any) => d

const lazyComponents = new Set()

function evalInContext(code: string, context: any) {
  // eslint-disable-next-line no-new-func
  return new Function('with(this) { return (' + code + ') }').call(context)
}

/**
 * Create component data from MDC node props.
 */
function propsToData(node: MDCNode, doc: DocusDocument) {
  const { tag = '', props = {} } = node

  return Object.keys(props).reduce(
    function (data, key) {
      const k = key.replace(/.*:/, '')
      let obj: any = rootKeys.includes(k) ? data : data.attrs
      const value = props[key]
      const { attribute } = find(html, key)
      const native = nativeInputs.includes(tag)

      if (rxModel.test(key) && value in doc && !native) {
        const mods = key
          .replace(rxModel, '')
          .split('.')
          .filter(d => d)
          .reduce((d, k) => {
            d[k] = true
            return d
          }, {} as any)

        // As of yet we don't resolve custom v-model field/event names from components
        const field = 'value'
        const event = mods.lazy ? 'change' : 'input'
        const processor = mods.number ? number : mods.trim ? trim : noop

        obj[field] = evalInContext(value, doc)
        data.on = data.on || {}
        data.on[event] = (e: any) => ((doc as any)[value] = processor(e))
      } else if (key === 'v-bind') {
        const val = value in doc ? (doc as any)[value] : evalInContext(value, doc)
        obj = Object.assign(obj, val)
      } else if (rxOn.test(key)) {
        key = key.replace(rxOn, '')
        data.on = data.on || {}
        data.on[key] = evalInContext(value, doc)
      } else if (rxBind.test(key)) {
        key = key.replace(rxBind, '')
        obj[key] = value in doc ? (doc as any)[value] : evalInContext(value, doc)
      } else if (Array.isArray(value)) {
        obj[attribute] = value.join(' ')
      } else {
        obj[attribute] = value
      }
      return data
    },
    { attrs: {} } as any
  )
}

/**
 * Create the scoped slots from `node` template children.
 * Templates for default slots are processed as regular children in `processNode`.
 */
function slotsToData(node: MDCNode, h: CreateElement, doc: DocusDocument) {
  const data: any = {}
  const children: MDCNode[] = node.children || []

  children.forEach(child => {
    // Regular children and default templates are processed inside `processNode`.
    if (!isTemplate(child) || isDefaultTemplate(child)) return

    // Non-default templates are converted into slots.
    data.scopedSlots = data.scopedSlots || {}
    const template = child
    const name = getSlotName(template)
    const vDomTree = template.content.map((tmplNode: MDCNode) => processNode(tmplNode, h, doc))
    data.scopedSlots[name] = function () {
      return vDomTree
    }
  })

  return data
}

function processNode(node: MDCNode, h: CreateElement, doc: DocusDocument): VNode | string | undefined {
  // Return raw value as it is
  if (node.type === 'text') return node.value

  const slotData = slotsToData(node || {}, h, doc)
  const propData = propsToData(node || {}, doc)
  const data = Object.assign({}, slotData, propData)

  // Process child nodes, flat-mapping templates pointing to default slots.
  const children = []
  for (const child of node.children!) {
    // Template nodes pointing to non-default slots are processed inside `slotsToData`.
    if (isTemplate(child) && !isDefaultTemplate(child)) continue

    const processQueue: MDCNode[] = isDefaultTemplate(child) ? child.content : [child]

    children.push(...processQueue.map(node => processNode(node, h, doc)))
  }

  // Add component name to lazyComponents set
  if (process.server && typeof Vue.component(pascalCase(node.tag)) === 'function') {
    lazyComponents.add(pascalCase(node.tag))
  }

  // Return VNode
  return h(node.tag, data, children)
}

const DEFAULT_SLOT = 'default'

/**
 * Check if node is root
 */
function isDefaultTemplate(node: MDCNode) {
  return isTemplate(node) && getSlotName(node) === DEFAULT_SLOT
}

/**
 * Check if node is Vue template tag
 */
function isTemplate(node: MDCNode) {
  return node.tag === 'template'
}

/**
 * Get slot name out of a node
 */
function getSlotName(node: MDCNode) {
  let name = ''

  for (const propName of Object.keys(node.props || {})) {
    // Check if prop name correspond to a slot
    if (!propName.startsWith('#') && !propName.startsWith('v-slot:')) continue

    // Get slot name
    name = propName.split(/[:#]/, 2)[1]

    break
  }

  return name || DEFAULT_SLOT
}

/**
 * DocusContent component
 */
export default {
  name: 'DocusContent',
  functional: true,
  props: {
    /**
     *
     */
    document: {
      type: [Object, String],
      required: true
    }
  },
  render(h: CreateElement, { data, props, parent, _v }: RenderContext & { _v: any }) {
    const { document } = props

    // Render simple string
    if (typeof document === 'string') return _v(document)

    // Get body from Docus document
    let { body } = (document || {}) as DocusDocument

    // Look for ast object in the document
    if (body && (body as any).ast) {
      body = (body as any).ast
    }

    // No content nor childrens found
    if (!body || !body.children || !Array.isArray(body.children)) return

    // Get element classes
    let classes = []
    if (Array.isArray(data.class)) {
      classes = data.class
    } else if (typeof data.class === 'object') {
      const keys = Object.keys(data.class)
      classes = keys.filter(key => data.class[key])
    } else {
      classes = [data.class]
    }
    data.class = classes

    // Get element props
    data.props = Object.assign({ ...body.props }, data.props)

    // Process children nodes
    const children = (body.children as MDCNode[]).map(child => processNode(child, h, document))

    // If server side, add components into lazy components set
    if (process.server) {
      ;(parent.$root as any).context.beforeSerialize((nuxtState: any) => {
        if (nuxtState.fetch._lazyComponents) lazyComponents.forEach(name => nuxtState.fetch._lazyComponents.add(name))
        else nuxtState.fetch._lazyComponents = lazyComponents
      })
    }

    // Detect root tag
    const tag = (body as MDCNode).tag || 'div'

    // Return Docus page content
    return h(tag, data, children)
  }
}
</script>
