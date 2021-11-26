<script lang="ts">
import { flatUnwrap, unwrap, isTag, expandTags } from '@docus/mdc/utils'

/**
 * Markdown component
 */
export default {
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
  render: (_: any, ctx: any) => {
    const slot = ctx.props.use || 'default'
    // Get slot node
    let node =
      typeof slot === 'string'
        ? ctx.parent.$scopedSlots[slot] ||
          ctx.parent.$slots[slot] ||
          ctx.parent.$parent?.$scopedSlots[slot] ||
          ctx.parent.$parent?.$slots[slot]
        : slot

    // Execute factory funciton
    if (typeof node === 'function') node = node()

    // If node is raw string, return it as it is
    if (typeof node === 'string') return [node]

    // Unwrap tags
    if (node && ctx.props.unwrap) {
      // Split tags from string prop
      const tags = expandTags(ctx.props.unwrap.split(/[,\s]/), ctx.parent.$config.docus.tagMap)

      // Get first tag from node
      const first = Array.isArray(node) && node[0]

      // Check if splitting is required
      const requireSplitor =
        ctx.scopedSlots.between &&
        first &&
        !first.text &&
        !['span', 'strong', 'em', 'a', 'code'].some(tag => isTag(first, tag))

      // Get properly unwrapped node
      if (requireSplitor) {
        node = node.flatMap((n: any, i: number) =>
          i === 0 ? unwrap(n, tags) : [ctx.scopedSlots.between(), unwrap(n, tags)]
        )
      } else {
        node = flatUnwrap(node, tags)
      }
    }

    if (Array.isArray(node) && node.length > 1 && (ctx.data.staticClass || ctx.data.class)) {
      // eslint-disable-next-line no-console
      console.warn('Markdown: `class` prop is ignored because there is multiple elements on component root.')
      // eslint-disable-next-line no-console
      console.warn('Markdown: This is likely to happen when you use `unwrap` attribute.')
    } else {
      const tmpNode = Array.isArray(node) ? node[0] : node
      if (tmpNode?.data) {
        Object.assign(tmpNode.data, ctx.data)
      }
    }

    return node
  }
}
</script>
