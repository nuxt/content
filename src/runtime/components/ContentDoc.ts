
import { PropType, defineComponent, h, useSlots, nextTick } from 'vue'
import type { QueryBuilderParams } from '../types'
import ContentRenderer from './ContentRenderer'
import ContentQuery from './ContentQuery'
import { useRoute, useHead } from '#imports'

export default defineComponent({
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
      default: () => useRoute().path
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
   * Document empty fallback
   * @slot empty
   */
  /**
   * Document not found fallback
   * @slot not-found
   */
  render (ctx) {
    const slots = useSlots()

    const { tag, excerpt, path, query } = ctx

    // Merge local `path` props and apply `findOne` query default.
    const contentQueryProps = Object.assign(query || {}, { path, find: 'one' })

    const emptyNode = (slot: string, data: any) => h('pre', null, JSON.stringify({ message: 'You should use slots with <ContentDoc>', slot, data }, null, 2))

    const addHead = (doc: any) => {
      if (path !== useRoute().path) { return }
      const head = Object.assign({}, doc.head)
      head.title = head.title || doc.title
      head.meta = head.meta || []
      const description = head.description || doc.description
      // Shortcut for head.description
      if (description && head.meta.filter(m => m.name === 'description').length === 0) {
        head.meta.push({
          name: 'description',
          content: description
        })
      }
      // Shortcut for head.image to og:image in meta
      if (head.image && head.meta.filter(m => m.property === 'og:image').length === 0) {
        head.meta.push({
          property: 'og:image',
          content: head.image
        })
      }
      if (process.client) { nextTick(() => useHead(head)) } else { useHead(head) }
    }

    return h(
      ContentQuery,
      contentQueryProps,
      {
        // Default slot
        default: slots?.default
          ? ({ data, refresh, isPartial }) => {
              addHead(data)
              return slots.default({ doc: data, refresh, isPartial, excerpt, ...this.$attrs })
            }
          : ({ data }) => {
              addHead(data)
              return h(
                ContentRenderer,
                { value: data, excerpt, tag, ...this.$attrs },
                // Forward local `empty` slots to ContentRenderer if it is used.
                { empty: bindings => slots?.empty ? slots.empty(bindings) : emptyNode('default', data) }
              )
            },
        // Empty slot
        empty: bindings => slots?.empty?.(bindings) || h('p', null, 'Document is empty, overwrite this content with #empty slot in <ContentDoc>.'),
        // Not Found slot
        'not-found': bindings => slots?.['not-found']?.(bindings) || h('p', null, 'Document not found, overwrite this content with #not-found slot in <ContentDoc>.')
      }
    )
  }
})
