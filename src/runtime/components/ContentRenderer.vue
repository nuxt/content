<script setup lang="ts">
import { kebabCase, pascalCase } from 'scule'
import { resolveComponent, toRaw, getCurrentInstance, defineAsyncComponent, computed } from 'vue'
import type { MDCComment, MDCElement, MDCRoot, MDCText } from '@nuxtjs/mdc'
import htmlTags from '@nuxtjs/mdc/runtime/parser/utils/html-tags-list'
import MDCRenderer from '@nuxtjs/mdc/runtime/components/MDCRenderer.vue'
import { globalComponents, localComponents } from '#content-v3/components'

interface Renderable {
  render?: (props: Record<string, unknown>) => unknown
  ssrRender?: (props: Record<string, unknown>) => unknown
}

const renderFunctions = ['render', 'ssrRender', '__ssrInlineRender'] as const

const props = defineProps({
  /**
   * Content to render
   */
  value: {
    type: Object,
    required: true,
  },
  /**
   * Render only the excerpt
   */
  excerpt: {
    type: Boolean,
    default: false,
  },
  /**
   * Root tag to use for rendering
   */
  tag: {
    type: String,
    default: 'div',
  },
  /**
   * The map of custom components to use for rendering.
   */
  components: {
    type: Object,
    default: () => ({}),
  },

  data: {
    type: Object,
    default: () => ({}),
  },
  /**
   * Whether or not to render Prose components instead of HTML tags
   */
  prose: {
    type: Boolean,
    default: undefined,
  },
  /**
   * Root tag to use for rendering
   */
  class: {
    type: [String, Object],
    default: undefined,
  },
  /**
   * Tags to unwrap separated by spaces
   * Example: 'ul li'
   */
  unwrap: {
    type: [Boolean, String],
    default: false,
  },
})

const debug = import.meta.dev

const body = computed(() => {
  let body = props.value.body || props.value
  if (props.excerpt && props.value.excerpt) {
    body = props.value.excerpt
  }

  return body
})

const data = computed(() => {
  const { body, excerpt, ...data } = props.value
  return {
    ...data,
    ...props.data,
  }
})

const proseComponentMap = Object.fromEntries(['p', 'a', 'blockquote', 'code', 'pre', 'code', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'img', 'ul', 'ol', 'li', 'strong', 'table', 'thead', 'tbody', 'td', 'th', 'tr', 'script'].map(t => [t, `prose-${t}`]))

const $nuxt = getCurrentInstance()?.appContext?.app?.$nuxt
const { mdc } = $nuxt?.$config?.public || {}
const tags = {
  ...mdc?.components?.prose && props.prose !== false ? proseComponentMap : {},
  ...mdc?.components?.map || {},
  ...toRaw(props.data?.mdc?.components || {}),
  ...props.components,
}

const key = computed(() => {
  if (!import.meta.dev) {
    return undefined
  }
  const res = Array.from(new Set(body.value ? loadComponents(body.value, { tags }) : []))
    .filter(t => localComponents.includes(pascalCase(String(t))))
    .sort()
    .join('.')

  return res
})

const componentsMap = computed(() => {
  return body.value ? resolveContentComponents(body.value, { tags }) : {}
})

function resolveVueComponent(component: string | Renderable) {
  let _component: unknown = component
  if (typeof component === 'string') {
    if (htmlTags.includes(component)) {
      return component
    }
    if (globalComponents.includes(pascalCase(component))) {
      _component = resolveComponent(component, false)
    }
    else if (localComponents.includes(pascalCase(component))) {
      _component = defineAsyncComponent(() => {
        // @ts-expect-error - typescript doesn't know about the import
        return import('#content-v3/components').then(m => m[pascalCase(component)]())
      })
    }
    if (typeof _component === 'string') {
      return _component
    }
  }

  if (!_component) {
    return _component
  }

  const componentObject = _component as Renderable
  if ('__asyncLoader' in componentObject) {
    return componentObject
  }

  if ('setup' in componentObject) {
    return defineAsyncComponent(() => Promise.resolve(componentObject as Renderable))
  }

  return componentObject
}

function resolveContentComponents(body: MDCRoot, meta: Record<string, unknown>) {
  if (!body) {
    return
  }
  const components = Array.from(new Set(loadComponents(body, meta as { tags: Record<string, string> })))
  const res = components.map((c) => {
    if (typeof c === 'object' && renderFunctions.some(fn => Object.hasOwnProperty.call(c, fn))) {
      return [false, false]
    }
    const resolvedComponent = resolveVueComponent(c as string)
    return [c, resolvedComponent]
  })
  return Object.fromEntries(res.filter(item => Boolean(item[0])))
}

function loadComponents(node: MDCRoot | MDCElement, documentMeta: { tags: Record<string, string> }) {
  const tag = (node as unknown as MDCElement).tag
  if ((node as unknown as MDCText).type === 'text' || tag === 'binding' || (node as unknown as MDCComment).type === 'comment') {
    return []
  }
  const renderTag = findMappedTag(node as unknown as MDCElement, documentMeta.tags)
  const components2 = [] as unknown[]
  if ((node as unknown as MDCRoot).type !== 'root' && !htmlTags.includes(renderTag)) {
    components2.push(renderTag)
  }
  for (const child of node.children || []) {
    components2.push(...loadComponents(child as MDCElement, documentMeta))
  }
  return components2
}

function findMappedTag(node: MDCElement, tags: Record<string, string>) {
  const tag = node.tag
  if (!tag || typeof node.props?.__ignoreMap !== 'undefined') {
    return tag
  }
  return tags[tag] || tags[pascalCase(tag)] || tags[kebabCase(node.tag)] || tag
}
</script>

<template>
  <MDCRenderer
    :key="key"
    :body="body"
    :data="data"
    :clas="props.class"
    :tag="props.tag"
    :prose="props.prose"
    :unwrap="props.unwrap"
    :components="componentsMap"
    :data-content-id="debug ? value._id : undefined"
  />
</template>
