<script lang="ts">
import { useRuntimeConfig } from '#app'
import { defineComponent, getCurrentInstance, Slot, VNode } from 'vue'

const unwrap = (vnodes: VNode[], tags: string[]) => {
  if (!tags.length) {
    return vnodes
  }

  return vnodes.map(vnode =>
    typeof vnode.type === 'object' && (tags[0] === '*' || (vnode.type as any).tag === tags[0])
      ? unwrap((vnode.children as any).default(), tags.slice(1))
      : vnode
  )
}

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
    const { content: { tags: tagMap } } = useRuntimeConfig()

    const slot = typeof props.use === 'string' ? parent?.slots[props.use] || parent?.parent?.slots[props.use] : props.use as Slot

    if (!slot) {
      return () => []
    }

    if (props.unwrap) {
      const tags = props.unwrap === true ? ['*'] : props.unwrap.split(' ')
      return () => unwrap(slot(), tags.map(tag => tagMap[tag] || tag))
    }

    return () => slot()
  }
})
</script>
