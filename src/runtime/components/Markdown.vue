<script lang="ts">
import ContentRichSlot from './ContentRichSlot'
import { defineComponent, getCurrentInstance, useSlots, computed } from '#imports'

/**
 * Markdown component
 */
export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Markdown',
  extends: ContentRichSlot,
  setup (props) {
    if (process.dev) {
      // eslint-disable-next-line no-console
      console.warn('[deprecation] <Markdown> component is deprecated. Please use <ContentRichSlot> instead.')
    }
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
  }
})
</script>
