<script lang="ts">
import { flatUnwrap, unwrap, isTag } from '@docus/mdc/utils'

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
  render: (_: any, ctx: any) => {
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
        node = node.flatMap((n: any, i: number) =>
          i === 0 ? unwrap(n, tags) : [ctx.scopedSlots.between(), unwrap(n, tags)]
        )
      } else {
        node = flatUnwrap(node, tags)
      }
    }

    return node
  }
}
</script>
