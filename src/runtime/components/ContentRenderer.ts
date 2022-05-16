import { defineComponent, watch, h, useSlots } from 'vue'
import { ParsedContent } from '../types'
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
    },
    /**
     * Whether or not to use the built-in MarkdownRenderer.
     * @default true
     */
    renderer: {
      type: Boolean,
      default: true
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

    const { value, excerpt, tag, renderer } = ctx

    // No value found, return `empty` slot
    if (!value) { return slots?.empty?.({ excerpt, tag, renderer }) || h('pre', undefined, JSON.stringify(value, null, 2)) }

    // Use built-in MarkdownRenderer
    if (renderer && value && value?.type === 'markdown' && value?.body?.children?.length) {
      return h(
        MarkdownRenderer,
        {
          value,
          excerpt,
          tag
        }
      )
    }

    return slots?.default
      // Render default slot with `value` as v-slot="{ data }"
      ? slots.default({ data: value as ParsedContent })
      // Render <pre>{{ value }}</pre> if no default slot but content present
      : slots?.empty?.({ excerpt, tag, renderer }) || h('pre', undefined, JSON.stringify(value, null, 2))
  }
})
