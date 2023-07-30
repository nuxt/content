<script lang="ts">
import { defineComponent, h, resolveComponent } from 'vue'

export default defineComponent({
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
  render (props: any) {
    return h(resolveComponent('MDCSlot'), props)
  }
})
</script>
