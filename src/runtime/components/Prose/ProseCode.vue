<script lang="ts">
import { defineComponent, useSlots, h } from '#imports'

export default defineComponent({
  props: {
    code: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: null
    },
    filename: {
      type: String,
      default: null
    },
    highlights: {
      type: Array as () => number[],
      default: () => []
    }
  },
  render (ctx) {
    const { code, language, filename, highlights } = ctx
    const slots = useSlots()

    // Render the default slot if present
    return slots?.default
      ? slots.default({
        code,
        language,
        filename,
        highlights,
        ...this.$attrs
      })
      : h('pre')
  }
})
</script>
