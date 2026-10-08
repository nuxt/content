import { computed, defineComponent, h } from 'vue'
import { NuxtLink } from '#components'
import type { PropType, SlotsType } from 'vue'
import { MarkdownDocument } from '@comark/vue'
import type { MarkdownDocumentProps } from '@comark/vue'
import type { MarkdownDocument as ComarkMarkdownDocument } from 'comark'

type MarkdownDocumentValue = NonNullable<MarkdownDocumentProps['value']>
/** A Nuxt Content v3 document, as returned by `queryCollection()`: frontmatter flattened next to `body`. */
type ContentDocumentValue = { body: MarkdownDocumentValue['nodes'] } & Record<string, any>

function isMarkdownDocument(value: MarkdownDocumentValue | ContentDocumentValue): value is MarkdownDocumentValue {
  return 'nodes' in value
}

const debug = import.meta.dev || (import.meta as { preview?: boolean }).preview

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
        'data': props.data,
        'data-content-id': dataContentId,
      })
    }
  },
})
