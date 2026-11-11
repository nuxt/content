import { computed, defineComponent, getCurrentInstance, h } from 'vue'

import type { Component, PropType, SlotsType } from 'vue'
import type { MarkdownDocumentProps } from '@comark/vue'
import ContentDocument from '../../components/ContentDocument'

type MarkdownDocumentValue = NonNullable<MarkdownDocumentProps['value']>
/** A v3 document: the parsed nodes under `body` (`{ value }` or the array itself), frontmatter flattened. */
type ContentDocumentValue = { body: { value: MarkdownDocumentValue['nodes'] } | MarkdownDocumentValue['nodes'] } & Record<string, any>

function isMarkdownDocument(value: MarkdownDocumentValue | ContentDocumentValue): value is MarkdownDocumentValue {
  return 'nodes' in value
}

let warned = false

/**
 * @deprecated Part of the Content v3 compatibility layer (`content.compatibilityVersion: 3`), use `<ContentDocument>` instead.
 */
export default defineComponent({
  name: 'ContentRenderer',
  props: {
    /**
     * Content to render: a Comark document (`{ nodes, frontmatter, meta }`) or a
     * v3 document (`{ body, ...frontmatter }`).
     */
    value: {
      type: Object as PropType<MarkdownDocumentValue | ContentDocumentValue>,
      default: undefined,
    },
    /**
     * Custom component mappings for element tags. Values can be component names
     * (`{ p: 'MyParagraph' }`), resolved as global components.
     */
    components: {
      type: Object as PropType<Record<string, Component | string>>,
      default: undefined,
    },
    /**
     * Additional data made available to the rendered tree (e.g. for binding
     * frontmatter/props).
     */
    data: {
      type: Object as PropType<MarkdownDocumentProps['data']>,
      default: undefined,
    },
  },
  slots: Object as SlotsType<{
    empty?: () => unknown
  }>,
  setup(props, { slots }) {
    if (import.meta.dev && !warned) {
      warned = true
      console.warn('[@nuxt/content] `<ContentRenderer>` is deprecated, use `<ContentDocument>` instead. Use `v-if` instead of its `empty` slot.')
    }

    const appContext = getCurrentInstance()?.appContext

    const document = computed(() => {
      if (!props.value) return undefined
      if (isMarkdownDocument(props.value)) return props.value
      const { body, id, path, ...rest } = props.value
      return {
        path,
        nodes: Array.isArray(body) ? body : body.value,
        frontmatter: rest,
        meta: { id },
      }
    })

    const components = computed(() => {
      if (!props.components) return undefined
      // Unknown names (e.g. another HTML tag such as `'div'`) are rendered as-is.
      return Object.fromEntries(Object.entries(props.components).map(([tag, component]) => [
        tag,
        typeof component === 'string' ? appContext?.components[component] ?? component : component,
      ])) as MarkdownDocumentProps['components']
    })

    return () => {
      if (!document.value) return slots.empty?.() ?? null
      return h(ContentDocument, {
        value: document.value,
        components: components.value,
        data: props.data,
      })
    }
  },
})
