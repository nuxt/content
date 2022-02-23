<script lang="ts">
import { defineComponent, getCurrentInstance, Slot } from 'vue'
import { useUnwrap } from '#imports'

/**
 * Markdown component
 */
export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Markdown',
  functional: true,
  props: {
    /**
      * A slot name or function
     */
    use: {
      type: [String, Function],
      default: 'default'
    },
    /**
     * Tags to unwrap separated by spaces
     * Example: 'ul li'
     */
    unwrap: {
      type: [Boolean, String],
      default: false
    }
  },
  setup (props) {
    const { parent } = getCurrentInstance()
    const { flatUnwrap } = useUnwrap()

    const slot = typeof props.use === 'string' ? parent?.slots[props.use] || parent?.parent?.slots[props.use] : props.use as Slot

    if (!slot) {
      return () => []
    }

    if (props.unwrap) {
      const tags = props.unwrap === true ? ['*'] : props.unwrap.split(' ')
      return () => flatUnwrap(slot(), tags)
    }

    return () => slot()
  }
})
</script>
