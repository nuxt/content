import { computed, defineComponent, h } from 'vue'
import type { PropType, SlotsType } from 'vue'
import { ComarkRenderer, type ComarkTree } from '@comark/vue'
import type { ComarkRendererProps } from '@comark/vue/components/ComarkRenderer'

const debug = import.meta.dev || import.meta.preview

export default defineComponent({
  name: 'ComarkContent',
  props: {
    /**
     * Content to render
     *
     * @deprecated Use `tree` instead.
     */
    value: {
      type: Object as PropType<{ body: ComarkRendererProps['tree']['nodes'] }>,
      default: undefined,
    },
    /**
     * Content to render
     */
    tree: {
      type: Object as PropType<ComarkRendererProps['tree']>,
      default: undefined,
    },
    /**
     * Custom component mappings for element tags
     */
    components: {
      type: Object as PropType<ComarkRendererProps['components']>,
      default: undefined,
    },
    /**
     * Additional data made available to the rendered tree (e.g. for binding
     * frontmatter/props).
     */
    data: {
      type: Object as PropType<ComarkRendererProps['data']>,
      default: undefined,
    },
  },
  slots: Object as SlotsType<{
    empty?: (props: { 'data-content-id': string | undefined }) => unknown
  }>,
  setup(props, { slots }) {
    const comarkTree = computed(() => {
      if (props.tree) return props.tree
      if (props.value) {
        const { body, id, path, ...rest } = (props.value || {}) as any
        return {
          path,
          nodes: body,
          frontmatter: rest,
          meta: {
            id,
          },
        }
      }
      return undefined
    })
    const isEmpty = computed(() => !comarkTree.value)

    return () => {
      const dataContentId = debug
        ? (comarkTree.value as ComarkTree)?.meta?.key
        : undefined

      if (isEmpty.value) {
        return slots.empty?.({ 'data-content-id': dataContentId }) ?? null
      }

      return h(ComarkRenderer, {
        'tree': comarkTree.value!,
        'components': props.components,
        'data': props.data,
        'data-content-id': dataContentId,
      })
    }
  },
})
