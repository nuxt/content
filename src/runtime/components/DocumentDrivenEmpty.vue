<script lang="ts">
import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'
import type { ParsedContent } from '../types'

/**
 * Used in `src/runtime/pages/document-driven.vue`
 */
export default defineComponent({
  name: 'DocumentDrivenEmpty',
  props: {
    value: {
      type: Object as PropType<ParsedContent>,
      required: true
    }
  },
  render ({ value }: any) {
    return h('div', undefined, [
      h('p', 'Document is empty'),
      h('p', `Add content to it by opening ${value._source}/${value._file} file.`)
    ])
  }
})
</script>
