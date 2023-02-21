<script lang="ts">
import ContentSlot from './ContentSlot.vue'
import { defineComponent, getCurrentInstance, useSlots, computed } from '#imports'

let showDeprecatedMessage = true

/**
 * Markdown component
 */
export default defineComponent({
  name: 'Markdown',
  extends: ContentSlot,
  setup (props) {
    if (process.dev && showDeprecatedMessage) {
      // eslint-disable-next-line no-console
      console.warn('[deprecation] <Markdown> component is deprecated. Please use <ContentSlot> instead.')
      showDeprecatedMessage = false
    }
    const { parent } = getCurrentInstance()!
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
