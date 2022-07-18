
import { PropType, defineComponent, h, useSlots } from 'vue'
import type { QueryBuilderParams } from '../types'
import ContentQuery from './ContentQuery'

export default defineComponent({
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
      default: '/'
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
  render (ctx) {
    const slots = useSlots()

    const { path, query } = ctx

    // Merge local `path` props and apply `findOne` query default.
    const contentQueryProps = Object.assign(query || {}, { path })

    const emptyNode = (slot: string, data: any) => h('pre', null, JSON.stringify({ message: 'You should use slots with <ContentList>', slot, data }, null, 2))

    return h(
      ContentQuery,
      contentQueryProps,
      {
        // Default slot
        default: slots?.default
          ? ({ data, refresh, isPartial }) => slots?.default({ list: data, refresh, isPartial, ...this.$attrs })
          : ({ data }) => emptyNode('default', data),
        // Empty slot
        empty: bindings => slots?.empty ? slots.empty(bindings) : ({ data }) => emptyNode('default', data),
        // Not Found slot
        'not-found': bindings => slots?.['not-found'] ? slots?.['not-found']?.(bindings) : ({ data }) => emptyNode('not-found', data)
      }
    )
  }
})
