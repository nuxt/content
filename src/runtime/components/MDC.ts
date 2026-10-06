import { defineComponent, h } from 'vue'
import { Markdown } from '@comark/vue'

/**
 * @deprecated This Component is part of Content v3 Compatibility and will be removed in Next version. Consider using `<Markdown>` component.
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
    return () => h(Markdown, {
      value: props.value || props.markdown,
      unwrap: props.unwrap,
    })
  },
})
