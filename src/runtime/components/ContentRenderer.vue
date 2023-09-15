<script lang="ts">
import { defineComponent, watch, h, useSlots } from 'vue'
import ContentRendererMarkdown from './ContentRendererMarkdown.vue'

export default defineComponent({
  name: 'ContentRenderer',
  props: {
    /**
     * The document to render.
     */
    value: {
      type: Object,
      required: false,
      default: () => ({})
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
     * The tag to use for the renderer element if it is used.
     * @default 'div'
     */
    tag: {
      type: String,
      default: 'div'
    }
  },
  setup (props) {
    /**
     * Watch `props.excerpt` and display error message if not found.
     */
    watch(
      () => props.excerpt,
      (newExcerpt) => {
        if (newExcerpt && !props.value?.excerpt) {
          // eslint-disable-next-line no-console
          console.warn(`No excerpt found for document content/${props?.value?._path}.${props?.value?._extension}!`)
          // eslint-disable-next-line no-console
          console.warn('Make sure to use <!--more--> in your content if you want to use excerpt feature.')
        }
      },
      {
        immediate: true
      }
    )
  },
  /**
   * Content empty fallback
   * @slot empty
   */
  render (ctx: any) {
    const slots = useSlots()

    const { value, excerpt, tag } = ctx

    const markdownAST = excerpt ? value?.excerpt : value?.body

    if (!markdownAST?.children?.length && slots?.empty) {
      // Fallback on `empty` slot.
      return slots.empty({ value, excerpt, tag, ...this.$attrs })
    }

    if (slots?.default) {
      return slots.default({ value, excerpt, tag, ...this.$attrs })
    }

    // Use built-in ContentRendererMarkdown
    if (markdownAST?.type === 'root' && markdownAST?.children?.length) {
      return h(
        ContentRendererMarkdown,
        {
          value,
          excerpt,
          tag,
          ...this.$attrs
        }
      )
    }

    // Fallback on JSON.stringify if no slot at all.
    return h(
      'pre',
      null,
      JSON.stringify({ message: 'You should use slots with <ContentRenderer>', value, excerpt, tag }, null, 2)
    )
  }
})
</script>
