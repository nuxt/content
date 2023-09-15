<script lang="ts">
import { type PropType, type VNode, defineComponent, h, useSlots } from 'vue'
import type { ParsedContent, QueryBuilderParams } from '../types'
import ContentQuery from './ContentQuery.vue'

const emptyNode = (slot: string, data: any) => h('pre', null, JSON.stringify({ message: 'You should use slots with <ContentList>', slot, data }, null, 2))

const ContentList = defineComponent({
  name: 'ContentList',
  props: {
    /**
     * Query props
     */

    /**
     * The path of the content to load from content source.
     * @default '/'
     */
    path: {
      type: String,
      required: false,
      default: undefined
    },

    /**
     * A query builder params object to be passed to <ContentQuery /> component.
     */
    query: {
      type: Object as PropType<QueryBuilderParams>,
      required: false,
      default: undefined
    }
  },

  /**
   * Content empty fallback
   * @slot empty
   */
  /**
   * Content not found fallback
   * @slot not-found
   */
  render (ctx: any) {
    const slots = useSlots()

    const { path, query } = ctx

    // Merge local `path` props and apply `findOne` query default.
    const contentQueryProps = {
      ...query || {},
      path: path || query?.path || '/'
    }

    return h(
      ContentQuery,
      contentQueryProps,
      {
        // Default slot
        default: slots?.default
          ? ({ data, refresh, isPartial }: any) => slots.default!({ list: data, refresh, isPartial, ...this.$attrs })
          : (bindings: any) => emptyNode('default', bindings.data),
        // Empty slot
        empty: (bindings: any) => slots?.empty ? slots.empty(bindings) : emptyNode('default', bindings?.data),
        // Not Found slot
        'not-found': (bindings: any) => slots?.['not-found'] ? slots?.['not-found']?.(bindings) : emptyNode('not-found', bindings?.data)
      }
    )
  }
})

export default ContentList as typeof ContentList & {
  new (): {
    $slots: {
      default: (context: { list: ParsedContent[], refresh: () => Promise<void> }) => VNode[] | undefined
    }
  }
}
</script>
