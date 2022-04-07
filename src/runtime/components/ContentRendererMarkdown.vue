<script lang="ts">
import { useRuntimeConfig } from '#app'
import { h, resolveComponent, Text, defineComponent } from 'vue'
import { pascalCase } from 'scule'
import { find, html } from 'property-information'
import htmlTags from 'html-tags'
import type { VNode, ConcreteComponent } from 'vue'

import type { MarkdownNode, ParsedContentMeta } from '../types'

type CreateElement = typeof h
type ContentVNode = VNode | string
type ContentMeta = Record<string, any>

/**
 * Create a factory function if there is a node in the list
 */
const createSlotFunction = (nodes: Array<VNode | string>) => (nodes.length ? () => nodes : undefined)

/**
 *  Default slot name
 */
const DEFAULT_SLOT = 'default'

const rxOn = /^@|^v-on:/
const rxBind = /^:|^v-bind:/
const rxModel = /^v-model/
const nativeInputs = ['select', 'textarea', 'input']
// Model modifiers
const number = (d: any) => +d
const trim = (d: any) => d.trim()
const noop = (d: any) => d

function valueInContext (code: string, context: ContentMeta) {
  return code.split('.').reduce((o: any, k) => o && o[k], context)
}

function evalInContext (code: string, context: any) {
  let result = valueInContext(code, context)
  if (typeof result === 'undefined') {
    try {
      result = JSON.parse(code)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Error evaluating ${code}`, e)
      result = code
    }
  }
  return result
}

/**
 * Create component data from MDC node props.
 */
function propsToData (node: MarkdownNode, documentMeta: ContentMeta) {
  const { tag = '', props = {} } = node
  return Object.keys(props).reduce(function (data, key) {
    const value = props[key]
    const { attribute } = find(html, key)
    const native = nativeInputs.includes(tag)
    if (rxModel.test(key) && value in documentMeta && !native) {
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
      data[field] = evalInContext(value, documentMeta)
      data.on = data.on || {}
      data.on[event] = (e: any) => ((documentMeta as any)[value] = processor(e))
    } else if (key === 'v-bind') {
      const val = evalInContext(value, documentMeta)
      data = Object.assign(data, val)
    } else if (rxOn.test(key)) {
      key = key.replace(rxOn, '')
      data.on = data.on || {}
      data.on[key] = () => evalInContext(value, documentMeta)
    } else if (rxBind.test(key)) {
      key = key.replace(rxBind, '')
      data[key] = evalInContext(value, documentMeta)
    } else if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
      // Join string arrays using space, see: https://github.com/nuxt/content/issues/247
      data[attribute] = value.join(' ')
    } else {
      data[attribute] = value
    }
    return data
  }, {} as any)
}

/**
 * Create the scoped slots from `node` template children.
 * Templates for default slots are processed as regular children in `processNode`.
 */
function processNonDefaultSlots (node: MarkdownNode, h: CreateElement, documentMeta: ContentMeta) {
  const data: any = {}
  const children: MarkdownNode[] = node.children || []
  children.forEach((child) => {
    // Regular children and default templates are processed inside `processNode`.
    if (!isTemplate(child) || isDefaultTemplate(child)) {
      return
    }
    const template = child
    const name = getSlotName(template)
    const vDomTree = template.content.map((tmplNode: MarkdownNode) => processNode(tmplNode, h, documentMeta))
    data[name] = createSlotFunction(vDomTree)
  })
  return data
}

function processNode (node: MarkdownNode, h: CreateElement, documentMeta: ContentMeta): ContentVNode {
  const originalTag = node.tag
  const renderTag: string = !node.props?.ignoreMap && documentMeta.tags[node.tag] ? documentMeta.tags[node.tag] : node.tag
  /**
   * Render Text node
   */
  if (node.type === 'text') {
    return h(Text, node.value)
  }
  const propData = propsToData(node, documentMeta)
  const data = Object.assign({}, propData)
  /**
   * Process child nodes, flat-mapping templates pointing to default slots.
   */
  const children: Array<VNode | string> = (node.children || []).flatMap((child) => {
    /**
     * Template nodes pointing to non-default slots are processed inside `slotsToData`.
     */
    if (isTemplate(child) && !isDefaultTemplate(child)) {
      return []
    }
    const nodes: MarkdownNode[] = isDefaultTemplate(child) ? child.content : [child]
    return (nodes || []).map((node: MarkdownNode) => processNode(node, h, documentMeta) as ContentVNode)
  })
  let component: string | ConcreteComponent | undefined = renderTag
  if (isVueComponent(component as string)) {
    component = resolveComponent(pascalCase(component), false)
    if (typeof component === 'object') {
      component.tag = originalTag
    }
  }
  return h(component as any, data, {
    ...processNonDefaultSlots(node, h, documentMeta),
    default: createSlotFunction(children)
  })
}

/**
 * Check if node is root
 */
function isDefaultTemplate (node: MarkdownNode) {
  return isTemplate(node) && getSlotName(node) === DEFAULT_SLOT
}

/**
 * Check if node is Vue template tag
 */
function isTemplate (node: MarkdownNode) {
  return node.tag === 'template'
}

/**
 * Check is node is a Vue component
 */
function isVueComponent (name: string) {
  return !htmlTags.includes(name)
}

/**
 * Get slot name out of a node
 */
function getSlotName (node: MarkdownNode) {
  let name = ''
  for (const propName of Object.keys(node.props || {})) {
    // Check if prop name correspond to a slot
    if (!propName.startsWith('#') && !propName.startsWith('v-slot:')) {
      continue
    }
    // Get slot name
    name = propName.split(/[:#]/, 2)[1]
    break
  }
  return name || DEFAULT_SLOT
}

export default defineComponent({
  name: 'ContentRendererMarkdown',
  functional: true,
  props: {
    /**
     * Content to render
     */
    document: {
      type: [Object, String],
      required: true
    },
    /**
     * Root tag to use for rendering
     */
    tag: {
      type: String,
      default: 'div'
    }
  },
  setup () {
    const { content: { tags } } = useRuntimeConfig()
    return {
      tags
    }
  },
  render () {
    const { document, ...contentProps } = this.$props
    // No content to render
    if (!document) {
      return
    }
    // Get body from document
    const body = (document.body || document) as MarkdownNode
    const meta: ParsedContentMeta = {
      ...document,
      tags: {
        ...this.tags || {},
        ...document?.tags || {}
      }
    }

    let component: string | ConcreteComponent = meta.component || this.$props.tag
    if (typeof meta.component === 'object') {
      component = meta.component.name
    }

    // Resolve component if it's a Vue component
    if (component && isVueComponent(component as string)) {
      const componentFn = resolveComponent(pascalCase(component as string), false)
      // If component exists
      if (componentFn !== component) {
        component = componentFn
      }
    }

    // Get node props
    const props: Record<string, any> = { ...contentProps, ...meta.component?.props }

    // Process children
    const children = (body.children || []).map(child => processNode(child, h, meta))

    // Return Vue component
    return h(component as any, props, { default: createSlotFunction(children) })
  }
})
</script>
