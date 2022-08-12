<script lang="ts">
import type { Slot } from 'vue'
import { defineComponent, getCurrentInstance, useSlots, computed, useUnwrap, h } from '#imports'

/**
 * ContentRichSlot component
 */
export default defineComponent({
  name: 'ContentRichSlot',
  functional: true,
  props: {
    /**
      * A slot name or function
     */
    use: {
      type: Function,
      default: undefined
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
    const { between, default: fallbackSlot } = useSlots()

    const tags = computed(() => {
      if (typeof props.unwrap === 'string') { return props.unwrap.split(' ') }
      return ['*']
    })

    return {
      fallbackSlot,
      tags,
      between,
      parent
    }
  },
  render ({ use, unwrap, fallbackSlot, between, tags, parent }) {
    try {
      let slot: Slot = use
      if (typeof use === 'string') {
        slot = parent?.slots[use] || parent?.parent?.slots[use]
        // eslint-disable-next-line no-console
        console.warn(`Please set :use="$slots.${use}" in <ContentRichSlot> component to enable reactivity`)
      }

      if (!slot) { return fallbackSlot ? fallbackSlot() : h('div') }

      if (!unwrap) { return [slot()] }

      const { flatUnwrap } = useUnwrap()

      const unwrapped = flatUnwrap(slot(), tags)

      if (between) {
        return unwrapped.flatMap(
          (vnode, index) => index === 0 ? [vnode] : [between(), vnode]
        )
      }

      return unwrapped.reduce((acc, item) => {
        if (typeof item.children === 'string') {
          if (typeof acc[acc.length - 1] === 'string') {
            acc[acc.length - 1] += item.children
          } else {
            acc.push(item.children)
          }
        } else {
          acc.push(item)
        }
        return acc
      }, [])
    } catch (e) {
      // Catching errors to allow content reactivity
      return h('div')
    }
  }
})
</script>
