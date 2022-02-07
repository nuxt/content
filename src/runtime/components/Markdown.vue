<script lang="ts">
import { defineComponent } from 'vue'
import { flatUnwrap, unwrap, isTag } from '../markdown-parser/utils'
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
      type: [String, Object, Function, Array],
      default: 'default'
    },
    /**
     *
     */
    unwrap: {
      type: String,
      default: ''
    }
  },
  render () {
    const { $props, $parent, $slots, $attrs } = this
    const slot = $props.use || 'default'
    // Get slot node
    let node =
      typeof slot === 'string'
        ? $parent && ($parent.$slots?.[slot] || $parent.$parent?.$slots?.[slot])
        : slot
    // Execute factory funciton
    if (typeof node === 'function') {
      node = node()
    }
    // If node is raw string, return it as it is
    if (typeof node === 'string') {
      return [node]
    }
    // Unwrap tags
    if (node && $props.unwrap) {
      // Split tags from string prop
      const tags = $props.unwrap.split(/[,\s]/)
      // Get first tag from node
      const first = Array.isArray(node) && node[0]
      // Check if splitting is required
      const requireSplitor =
        $slots.between &&
        first &&
        !first.text &&
        !['span', 'strong', 'em', 'a', 'code'].some(tag => isTag(first, tag))
      // Get properly unwrapped node
      if (requireSplitor) {
        node = node.flatMap((n: any, i: number) =>
          i === 0
            ? unwrap(n, tags)
            : [(this as any).$slot.between(), unwrap(n, tags)]
        )
      } else {
        node = flatUnwrap(node, tags)
      }
    }
    /**
     * Unwrap array if there is only one element in it
     */
    if (node && node.length === 1) {
      node = node[0]
    }
    /**
     * Pass `$attrs` to root node
     *
     * If there are multiple nodes, Vue will raise warning message
     */
    if (node?.$attrs) {
      Object.assign(node.$attrs, $attrs)
    }
    /**
     * Fallback to default slot if no node is found
     * Usage: `<Markdown>Default Value</Markdown>`
     */
    if (!node && typeof $slots.default === 'function') {
      return $slots.default()
    }
    return node
  }
})
</script>
