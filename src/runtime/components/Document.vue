<script lang="ts">
import { defineComponent, watch, h, useSlots } from 'vue'
import { MarkdownRenderer } from '#components'

export default defineComponent({
  props: {
    value: {
      type: Object,
      required: false
    },
    excerpt: {
      type: Boolean,
      default: false
    },
    tag: {
      type: String,
      default: 'div'
    }
  },
  setup (props) {
    watch(
      () => props.excerpt,
      (newExcerpt) => {
        if (newExcerpt && !value.excerpt) {
          // eslint-disable-next-line no-console
          console.warn(`No excerpt found for document content/${value.path}.${value.extension}!`)
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

    if (!value) { return [] }

    if (value && value?.type === 'markdown' && value?.body?.children?.length) {
      return h(MarkdownRenderer, {
        document: value,
        excerpt,
        tag
      })
    } else if (value?.type !== 'markdown' && value?.body) {
      const { body = {} } = value

      // If body is plain string, render it
      if (typeof body === 'string') { return h(tag, {}, body) }

      if (typeof body === 'object') { return h('pre', null, JSON.stringify(body, null, 2)) }
      // WIP: Bind body to props 😈
      // Check if body has keys
      /*
        if (Object.keys(body).length) {
          if (Array.isArray(body)) {
            if (slots.default) {
              return body.map((props) => {
                let slot = slots.default()

                slot = slot.children[0]

                slot.props = props

                return slot
              })
            } else {
              return h(tag, {}, body)
            }
          } else {
            return slots.default(body)
          }
        }
      }
      */
    }

    return h(
      tag,
      {},
      // Render default / empty slot
      slots?.empty?.() ||
      // Render empty node
      []
    )
  }
})
</script>
