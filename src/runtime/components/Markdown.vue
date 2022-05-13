<script lang="ts">
import { defineComponent, getCurrentInstance, useSlots } from 'vue'
import type { Slot } from 'vue'
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

    const tags = computed(() => {
      if (typeof props.unwrap === 'string') { return props.unwrap.split(' ') }
      return ['*']
    })

    return {
      tags,
      between,
      parent
    }
  },
  render ({ use, unwrap, between, tags, parent }) {
    try {
      const slot: Slot = typeof use === 'string' ? parent?.slots[use] || parent?.parent?.slots[use] : use

      if (!slot) { return [] }

      if (!unwrap) { return [slot()] }

      const { flatUnwrap } = useUnwrap()

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
    } catch (e) {
      // Catching errors to allow content reactivity
      return []
    }
  }
})
</script>
