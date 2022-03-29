<script lang="ts">
import { defineComponent, getCurrentInstance, useSlots, Slot } from 'vue'
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
    const { between } = useSlots()
    const { flatUnwrap } = useUnwrap()

    const slot = typeof props.use === 'string' ? parent?.slots[props.use] || parent?.parent?.slots[props.use] : props.use as Slot

    if (!slot) {
      return () => []
    }

    if (props.unwrap) {
      const tags = props.unwrap === true ? ['*'] : props.unwrap.split(' ')
      return () => {
        const unwrapped = flatUnwrap(slot(), tags)
        return between
          ? unwrapped.flatMap((vnode, index) => index === 0 ? [vnode] : [between(), vnode])
          : unwrapped.reduce((acc, item) => {
            // Concat raw texts to prevent hydration mismatches
            (typeof item.children === 'string' && acc.length && typeof acc[acc.length - 1].children === 'string')
              ? acc[acc.length - 1].children += item.children
              : acc.push(item)
            return acc
          }, [])
      }
    }

    return () => slot()
  }
})
</script>
