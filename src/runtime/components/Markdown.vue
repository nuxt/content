<script lang="ts">
import { flatUnwrap, unwrap, isTag } from '~docus-core/utils'

export default {
  name: 'Markdown',
  functional: true,
  props: {
    use: {
      type: [String, Object, Function, Array],
      default: 'default'
    },
    unwrap: {
      type: String,
      default: ''
    }
  },
  render: (h, ctx) => {
    const slot = ctx.props.use || 'default'
    let node =
      typeof slot === 'string'
        ? ctx.parent.$scopedSlots[slot] ||
          ctx.parent.$slots[slot] ||
          ctx.parent.$parent?.$scopedSlots[slot] ||
          ctx.parent.$parent?.$slots[slot]
        : slot

    // Execute factory funciton
    if (typeof node === 'function') {
      node = node()
    }

    if (typeof node === 'string') {
      return [node]
    }

    // unwrap tags
    if (node && ctx.props.unwrap) {
      const tags = ctx.props.unwrap.split(/[,\s]/)

      const first = Array.isArray(node) && node[0]
      const requireSplitor =
        ctx.scopedSlots.between &&
        first &&
        !first.text &&
        !['span', 'strong', 'em', 'a', 'code'].some(tag => isTag(first, tag))

      if (requireSplitor) {
        node = node.flatMap((n, i) => (i === 0 ? unwrap(n, tags) : [ctx.scopedSlots.between(), unwrap(n, tags)]))
      } else {
        node = flatUnwrap(node, tags)
      }
    }

    // handle child arrays
    // can be removed in vue 3
    node = node.map((n: any) => {
      if (Array.isArray(n)) {
        return h('div', {}, n)
      }
      return n
    })
    if (node && node.length > 1) {
      return h('div', {}, node)
    }

    return node
  }
}
</script>
