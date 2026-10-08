import { computed, defineAsyncComponent, defineComponent, h } from 'vue'
import { NuxtLink } from '#components'
import type { Component, PropType, SlotsType } from 'vue'
import { MarkdownDocument } from '@comark/vue'
import { pascalCase } from '@comark/vue/utils'
import type { MarkdownDocumentProps } from '@comark/vue'
import type { MarkdownDocument as ComarkMarkdownDocument } from 'comark'

// The module writes one re-export per scanned component here. Virtual imports
// have to be static for the bundler to rewrite them; the file only exists in a Nuxt build.
import * as mdcComponents from '#build/content/components.mjs'

type MarkdownDocumentValue = NonNullable<MarkdownDocumentProps['value']>
/** A Nuxt Content v3 document, as returned by `queryCollection()`: frontmatter flattened next to `body`. */
type ContentDocumentValue = { body: MarkdownDocumentValue['nodes'] } & Record<string, any>

function isMarkdownDocument(value: MarkdownDocumentValue | ContentDocumentValue): value is MarkdownDocumentValue {
  return 'nodes' in value
}

const debug = import.meta.dev || (import.meta as { preview?: boolean }).preview

function resolveApplicationComponent(name: string): Component | undefined {
  const pascal = pascalCase(name)
  const components = mdcComponents as Record<string, Component>
  for (const candidate of new Set([pascal, `Prose${pascal}`])) {
    const component = components[candidate]
    if (component) {
      return defineAsyncComponent(() => Promise.resolve(component))
    }
  }
}

export default defineComponent({
  name: 'ComarkContent',
  props: {
    /**
     * Content to render: a Comark document (`{ nodes, frontmatter, meta }`) or a
     * document returned by `queryCollection()` (`{ body, ...frontmatter }`).
     */
    value: {
      type: Object as PropType<MarkdownDocumentValue | ContentDocumentValue>,
      default: undefined,
    },
    /**
     * Custom component mappings for element tags
     */
    components: {
      type: Object as PropType<MarkdownDocumentProps['components']>,
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
    empty?: (props: { 'data-content-id': string | undefined }) => unknown
  }>,
  setup(props, { slots }) {
    const comarkTree = computed(() => {
      if (!props.value) return undefined
      if (isMarkdownDocument(props.value)) return props.value
      const { body, id, path, ...rest } = props.value
      return {
        path,
        nodes: body,
        frontmatter: rest,
        meta: {
          id,
        },
      }
    })
    const isEmpty = computed(() => !comarkTree.value)

    return () => {
      const dataContentId = debug
        ? (comarkTree.value as ComarkMarkdownDocument)?.meta?.key
        : undefined

      if (isEmpty.value) {
        return slots.empty?.({ 'data-content-id': dataContentId }) ?? null
      }

      return h(MarkdownDocument, {
        'value': comarkTree.value!,
        'components': {
          a: NuxtLink,
          ...props.components,
        },
        'componentsManifest': resolveApplicationComponent,
        'data': props.data,
        'data-content-id': dataContentId,
      })
    }
  },
})
