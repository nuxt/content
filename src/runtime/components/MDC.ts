import { defineComponent, h } from 'vue'
import { Comark } from '@comark/vue'

/**
 * @deprecated This Component is part of Content v3 Compatibility and will be removed in Next version. Consider using `<Comark>` component.
 */
export default defineComponent({
  name: 'ContentRendererMarkdown',
  props: {
    markdown: {
      type: String,
      default: () => '',
    },
    value: {
      type: String,
      default: () => '',
    },
    unwrap: {
      type: String,
      default: () => undefined,
    },
  },
  setup(props) {
    return () => h(Comark, {
      markdown: props.value || props.markdown,
      unwrap: props.unwrap,
    })
  },
})
