<script lang="ts">
import { PropType, defineComponent, h, useSlots } from 'vue'
import { withTrailingSlash } from 'ufo'
import type { QueryBuilderParams } from '../types'
import ContentRenderer from './ContentRenderer.vue'
import ContentQuery from './ContentQuery.vue'
import { useRoute, useContentHead } from '#imports'

export default defineComponent({
  name: 'ContentDoc',
  props: {
    /**
     * Renderer props
     */

    /**
     * The tag to use for the renderer element if it is used.
     * @default 'div'
     */
    tag: {
      type: String,
      required: false,
      default: 'div'
    },

    /**
     * Whether or not to render the excerpt.
     * @default false
     */
    excerpt: {
      type: Boolean,
      default: false
    },

    /**
     * Query props
     */

    /**
     * The path of the content to load from content source.
     * @default useRoute().path
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
    },

    /**
     * Whether or not to map the document data to the `head` property.
     */
    head: {
      type: Boolean,
      required: false,
      default: true
    }
  },

  /**
   * Document empty fallback
   * @slot empty
   */
  /**
   * Document not found fallback
   * @slot not-found
   */
  render (ctx: any) {
    const slots = useSlots()

    const { tag, excerpt, path, query, head } = ctx

    // Merge local `path` props and apply `findOne` query default.
    const contentQueryProps = {
      ...query || {},
      path: path || query?.path || withTrailingSlash(useRoute().path),
      find: 'one'
    }

    const emptyNode = (slot: string, data: any) => h('pre', null, JSON.stringify({ message: 'You should use slots with <ContentDoc>', slot, data }, null, 2))

    return h(
      ContentQuery,
      contentQueryProps,
      {
        // Default slot
        default: slots?.default
          ? ({ data, refresh, isPartial }: any) => {
              if (head) { useContentHead(data) }

              return slots.default?.({ doc: data, refresh, isPartial, excerpt, ...this.$attrs })
            }
          : ({ data }: any) => {
              if (head) { useContentHead(data) }

              return h(
                ContentRenderer,
                { value: data, excerpt, tag, ...this.$attrs },
                // Forward local `empty` slots to ContentRenderer if it is used.
                { empty: (bindings: any) => slots?.empty ? slots.empty(bindings) : emptyNode('default', data) }
              )
            },
        // Empty slot
        empty: (bindings: any) => slots?.empty?.(bindings) || h('p', null, 'Document is empty, overwrite this content with #empty slot in <ContentDoc>.'),
        // Not Found slot
        'not-found': (bindings: any) => slots?.['not-found']?.(bindings) || h('p', null, 'Document not found, overwrite this content with #not-found slot in <ContentDoc>.')
      }
    )
  }
})
</script>
