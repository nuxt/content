import { defineComponent, watch, h, useSlots } from 'vue'
import MarkdownRenderer from './MarkdownRenderer'

export default defineComponent({
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
          console.warn(`No excerpt found for document content/${props?.value?.path}.${props?.value?.extension}!`)
          // eslint-disable-next-line no-console
          console.warn('Make sure to use <!--more--> in your content if you want to use excerpt feature.')
        }
      },
      {
        immediate: true
      }
    )
  },
  render (ctx) {
    const slots = useSlots()

    const { value, excerpt, tag } = ctx

    // Use built-in MarkdownRenderer
    if (value && value?.type === 'markdown' && value?.body?.children?.length) {
      return h(
        MarkdownRenderer,
        {
          value,
          excerpt,
          tag,
          ...this.$attrs
        }
      )
    }

    if (value && slots?.default) {
      return slots.default({ value, excerpt, tag })
    } else if (slots?.empty) {
      // Fallback on `empty` slot.
      return slots.empty({ value, excerpt, tag })
    } else if (slots?.default) {
      // Fallback on `default` slot with undefined `value` if no `empty` slot.
      return slots.default({ value, excerpt, tag })
    }

    // Fallback on JSON.stringify if no slot at all.
    return h(
      'pre',
      null,
      JSON.stringify({ message: 'You should use slots with <ContentRenderer>!', value, excerpt, tag }, null, 2)
    )
  }
})
