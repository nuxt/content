
import { PropType, toRefs, defineComponent, h, useSlots, watch } from 'vue'
import type { ParsedContent, QueryBuilderParams } from '../types'
import ContentRenderer from './ContentRenderer'
import { useHead, useRoute, computed, useAsyncData, queryContent } from '#imports'

export default defineComponent({
  props: {
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
     * Whether or not to use the built-in MarkdownRenderer.
     * @default true
     */
    renderer: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * Bind the query to the `route.path` so the content is in sync with the page.
     *
     * Will stay enabled even when using `query`.
     *
     * @default true
     */
    sync: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * A query to be passed to `queryContent()`.
     */
    query: {
      type: Object as PropType<QueryBuilderParams>,
      required: false,
      default: undefined
    },
    /**
     * A type of query to be made.
     *
     * @default findOne
     */
    type: {
      type: String as PropType<'findOne' | 'find'>,
      required: false,
      default: 'findOne'
    }
  },
  async setup (props) {
    const {
      path,
      sync,
      query,
      type
    } = toRefs(props)

    const route = useRoute()

    const isPartial = computed(() => path.value.includes('/_'))

    const { data, refresh } = await useAsyncData<ParsedContent>(
      `content-doc-${path.value}`,
      () => {
        let queryBuilder

        if (sync.value) {
          queryBuilder = queryContent(path.value).where({ partial: isPartial.value })
        } else {
          queryBuilder = queryContent(query.value)
        }

        // Return find or findOne
        return queryBuilder[type.value]()
      }
    )

    const updateHead = () => {
      if (!data.value) { return }

      const { path = false, head = {}, partial = false, description = false } = data.value

      // Head management (only if doc = route path)
      if (path && path === route.path && !partial) {
        head.title = head.title || data.title
        head.meta = head.meta || []

        if (description && head.meta.filter(m => m.name === 'description').length === 0) {
          head.meta.push({
            name: 'description',
            content: data.value?.description || ''
          })
        }
      }

      // Throws an "nuxt instance unavailable" error
      useHead(head)
    }

    watch(data, () => updateHead())

    return {
      isPartial,
      data,
      refresh
    }
  },
  render (ctx) {
    const slots = useSlots()

    const {
      path,
      tag,
      renderer,
      sync,
      query,
      type,
      isPartial,
      data,
      refresh,
      excerpt
    } = ctx

    if (Array.isArray(data)) {
      // Render data as array
      return slots?.default?.({ data, isPartial, refresh }) || h('pre', undefined, JSON.stringify(data, null, 2))
    }

    // Render empty data object
    if (!data || !Object.keys(data?.body || {}).length) {
      return slots?.empty?.({ excerpt, path, tag, renderer, sync, query, type, isPartial, refresh })
    }

    // Renderer disabled, use default slot
    if (!renderer) {
      return slots?.default?.({ data, isPartial, refresh }) || h('pre', undefined, JSON.stringify(data, null, 2))
    }

    // Use ContentRenderer
    return h(ContentRenderer, {
      value: data,
      tag,
      excerpt,
      renderer
    })
  }
})
