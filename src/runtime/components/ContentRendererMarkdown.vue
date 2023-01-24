<script lang="ts">
import { h, resolveComponent, Text, defineComponent } from 'vue'
import destr from 'destr'
import { pascalCase } from 'scule'
import { find, html } from 'property-information'
// eslint-disable-next-line import/no-named-as-default
import htmlTags from 'html-tags'
import type { VNode, ConcreteComponent } from 'vue'
import { useRuntimeConfig, useRoute } from '#app'
import type { MarkdownNode, ParsedContentMeta } from '../types'

type CreateElement = typeof h

/**
 *  Default slot name
 */
const DEFAULT_SLOT = 'default'

const rxOn = /^@|^v-on:/
const rxBind = /^:|^v-bind:/
const rxModel = /^v-model/
const nativeInputs = ['select', 'textarea', 'input']

export default defineComponent({
  name: 'ContentRendererMarkdown',
  props: {
    /**
     * Content to render
     */
    value: {
      type: Object,
      required: true
    },
    /**
     * Render only the excerpt
     */
    excerpt: {
      type: Boolean,
      default: false
    },
    /**
     * Root tag to use for rendering
     */
    tag: {
      type: String,
      default: 'div'
    },
    /**
     * The map of custom components to use for rendering.
     */
    components: {
      type: Object,
      default: () => ({})
    }
  },
  async setup (props) {
    const { content: { tags = {} } } = useRuntimeConfig().public

    await resolveContentComponents(props.value.body, {
      tags: {
        ...tags,
        ...props.value?._components || {},
        ...props.components
      }
    })

    return { tags }
  },
  render (ctx) {
    const { tags, tag, value, components } = ctx

    if (!value) {
      return null
    }

    // Get body from value
    let body = (value.body || value) as MarkdownNode
    if (ctx.excerpt && value.excerpt) {
      body = value.excerpt
    }
    const meta: ParsedContentMeta = {
      ...(value as ParsedContentMeta),
      tags: {
        ...tags,
        ...value?._components || {},
        ...components
      }
    }

    let component: string | ConcreteComponent = meta.component || tag
    if (typeof meta.component === 'object') {
      component = meta.component.name
    }

    // Resolve component if it's a Vue component
    component = resolveVueComponent(component as string)

    // Return Vue component
    return h(
      component as any,
      { ...meta.component?.props, ...this.$attrs },
      renderSlots(body, h, meta, meta)
    )
  }
})

/**
 * Render a markdown node
 */
function renderNode (node: MarkdownNode, h: CreateElement, documentMeta: ParsedContentMeta, parentScope: any = {}): VNode {
  /**
   * Render Text node
   */
  if (node.type === 'text') {
    return h(Text, node.value)
  }

  if (node.tag === 'script') {
    return renderToText(node)
  }

  const originalTag = node.tag!
  // `_ignoreMap` is an special prop to disables tag-mapper
  const renderTag: string = (typeof node.props?.__ignoreMap === 'undefined' && documentMeta.tags[originalTag]) || originalTag

  if (node.tag === 'binding') {
    return renderBinding(node, h, documentMeta, parentScope)
  }

  const component = resolveVueComponent(renderTag)
  if (typeof component === 'object') {
    component.tag = originalTag
  }

  const props = propsToData(node, documentMeta)

  return h(
    component as any,
    props,
    renderSlots(node, h, documentMeta, { ...parentScope, ...props })
  )
}

function renderToText (node: MarkdownNode) {
  if (node.type === 'text') {
    return node.value
  }

  if (!node.children?.length) {
    return `<${node.tag}>`
  }

  return `<${node.tag}>${node.children?.map(renderToText).join('') || ''}</${node.tag}>`
}

function renderBinding (node: MarkdownNode, h: CreateElement, documentMeta: ParsedContentMeta, parentScope: any = {}): VNode {
  const data = {
    ...parentScope,
    $route: () => useRoute(),
    $document: documentMeta,
    $doc: documentMeta
  }
  const splitter = /\.|\[(\d+)\]/
  const keys = node.props?.value.trim().split(splitter).filter(Boolean)
  const value = keys.reduce((data, key) => {
    if (key in data) {
      if (typeof data[key] === 'function') {
        return data[key]()
      } else {
        return data[key]
      }
    }
    return {}
  }, data)

  return h(Text, value)
}

/**
 * Create slots from `node` template children.
 */
function renderSlots (node: MarkdownNode, h: CreateElement, documentMeta: ParsedContentMeta, parentProps: any): Record<string, () => VNode[]> {
  const children: MarkdownNode[] = node.children || []

  const slotNodes: Record<string, MarkdownNode[]> = children.reduce((data, node) => {
    if (!isTemplate(node)) {
      data[DEFAULT_SLOT].push(node)
      return data
    }

    const slotName = getSlotName(node)
    data[slotName] = data[slotName] || []
    // Append children to slot
    data[slotName].push(...(node.children || []))

    return data
  }, {
    [DEFAULT_SLOT]: [] as any[]
  })

  const slots = Object.entries(slotNodes).reduce((slots, [name, children]) => {
    if (!children.length) { return slots }

    slots[name] = () => {
      const vNodes = children.map(child => renderNode(child, h, documentMeta, parentProps))
      return mergeTextNodes(vNodes)
    }

    return slots
  }, {} as Record<string, () => VNode[]>)

  return slots
}

/**
 * Create component data from node props.
 */
function propsToData (node: MarkdownNode, documentMeta: ParsedContentMeta) {
  const { tag = '', props = {} } = node
  return Object.keys(props).reduce(function (data, key) {
    // Ignore internal `__ignoreMap` prop.
    if (key === '__ignoreMap') { return data }

    const value = props[key]

    // `v-model="foo"`
    if (rxModel.test(key) && !nativeInputs.includes(tag)) {
      return propsToDataRxModel(key, value, data, documentMeta)
    }

    // `v-bind="{foo: 'bar'}"`
    if (key === 'v-bind') {
      return propsToDataVBind(key, value, data, documentMeta)
    }

    // `v-on="foo"`
    if (rxOn.test(key)) {
      return propsToDataRxOn(key, value, data, documentMeta)
    }

    // `:foo="bar"`, `v-bind:foo="bar"`
    if (rxBind.test(key)) {
      return propsToDataRxBind(key, value, data, documentMeta)
    }

    const { attribute } = find(html, key)

    // Join string arrays using space, see: https://github.com/nuxt/content/issues/247
    if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
      data[attribute] = value.join(' ')
      return data
    }

    data[attribute] = value

    return data
  }, {} as any)
}

/**
 * Handle `v-model`
 */
function propsToDataRxModel (key: string, value: any, data: any, documentMeta: ParsedContentMeta) {
  // Model modifiers
  const number = (d: any) => +d
  const trim = (d: any) => d.trim()
  const noop = (d: any) => d

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

  return data
}

/**
 * Handle object binding `v-bind`
 */
function propsToDataVBind (_key: string, value: any, data: any, documentMeta: ParsedContentMeta) {
  const val = evalInContext(value, documentMeta)
  data = Object.assign(data, val)
  return data
}

/**
 * Handle `v-on` and `@`
 */
function propsToDataRxOn (key: string, value: any, data: any, documentMeta: ParsedContentMeta) {
  key = key.replace(rxOn, '')
  data.on = data.on || {}
  data.on[key] = () => evalInContext(value, documentMeta)
  return data
}

/**
 * Handle single binding `v-bind:` and `:`
 */
function propsToDataRxBind (key: string, value: any, data: any, documentMeta: ParsedContentMeta) {
  key = key.replace(rxBind, '')
  data[key] = evalInContext(value, documentMeta)
  return data
}

/**
 * Resolve component if it's a Vue component
 */
const resolveVueComponent = (component: string) => {
  // Check if node is not a native HTML tag
  if (!htmlTags.includes(component as any)) {
    const componentFn = resolveComponent(pascalCase(component), false)
    // If component exists
    if (typeof componentFn === 'object') {
      return componentFn
    }
  }
  return component
}

/**
 * Evaluate value in specific context
 */
function evalInContext (code: string, context: any) {
  // Retrive value from context
  const result = code
    .split('.')
    .reduce((o: any, k) => typeof o === 'object' ? o[k] : undefined, context)

  return typeof result === 'undefined' ? destr(code) : result
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

/**
 * Check if node is Vue template tag
 */
function isTemplate (node: MarkdownNode) {
  return node.tag === 'template'
}

/**
 * Merge consequent Text nodes into single node
 */
function mergeTextNodes (nodes: Array<VNode>) {
  const mergedNodes: Array<VNode> = []
  for (const node of nodes) {
    const previousNode = mergedNodes[mergedNodes.length - 1]
    if (node.type === Text && previousNode?.type === Text) {
      previousNode.children = (previousNode.children as string) + node.children
    } else {
      mergedNodes.push(node)
    }
  }
  return mergedNodes
}

async function resolveContentComponents (body, meta) {
  const components = Array.from(new Set(loadComponents(body, meta)))
  await Promise.all(components.map(async (c) => {
    const resolvedComponent = resolveComponent(c) as any
    if (resolvedComponent?.__asyncLoader && !resolvedComponent.__asyncResolved) {
      await resolvedComponent.__asyncLoader()
    }
  }))

  function loadComponents (node, documentMeta) {
    if (node.type === 'text' || node.tag === 'binding') {
      return []
    }
    const renderTag: string = (typeof node.props?.__ignoreMap === 'undefined' && documentMeta.tags[node.tag!]) || node.tag!
    const components: string[] = []
    if (node.type !== 'root' && !htmlTags.includes(renderTag as any)) {
      components.push(renderTag)
    }
    for (const child of (node.children || [])) {
      components.push(...loadComponents(child, documentMeta))
    }
    return components
  }
}
</script>
