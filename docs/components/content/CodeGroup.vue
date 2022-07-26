<script lang="ts">
import { defineComponent, h } from '#imports'
import TabsHeader from './TabsHeader.vue'

const isTag = (slot: any, tag: string) => {
  return slot.type && slot.type.tag && slot.type.tag === tag
}

export default defineComponent({
  data () {
    return {
      activeTabIndex: 0,
      /**
       * A simple number that increases on every changes
       */
      counter: 0
    }
  },
  render () {
    const slots = this.$slots.default()
    const tabs = slots
      .filter(slot => isTag(slot, 'code-block') || isTag(slot, 'code'))
      .map((slot, index) => {
        return {
          label: slot?.props?.filename || slot?.props?.label || `${index}`,
          active: slot?.props?.active || false,
          component: slot
        }
      })
    // return slots
    return h(
      'div',
      {
        class: {
          'code-group': true,
          'first-tab': this.activeTabIndex === 0
        }
      },
      [
        h(TabsHeader, {
          ref: 'tabs-header',
          activeTabIndex: this.activeTabIndex,
          tabs,
          'onUpdate:activeTabIndex': $event => (this.activeTabIndex = $event)
        }),
        h(
          'div',
          {
            class: 'code-group-content',
            text: this.activeTabIndex
          },
          // Map slots to content children
          slots.map((slot, index) =>
            h(
              'div',
              {
                // Current slot is displayed, others are hidden
                style: {
                  display: index === this.activeTabIndex ? 'block' : 'none'
                },
                class: {
                  '': !isTag(slot, 'code')
                }
              },
              // Display direct children if not a ```code``` block
              [
                isTag(slot, 'code')
                  ? slot
                  : h(
                    'div',
                    {
                      class: {
                        'preview-canvas': true
                      }
                    },
                    [slot.children?.default?.() || h('div')]
                  )
              ]
            )
          )
        )
      ]
    )
  }
})
</script>

<style lang="postcss">
li {
  .code-group {
    @apply my-4;
  }
}

html.dark {
  .code-group-content {
    .preview-canvas {
      @apply z-0 my-0 overflow-x-auto rounded-bl-lg rounded-br-lg rounded-tl-none rounded-tr-none bg-gray-900 p-4 leading-normal;
    }
  }
}
</style>

<style scoped lang="postcss">
.code-group {
  @apply overflow-hidden rounded-lg;

  :deep(.prose-code) {
    @apply mt-0 mb-0 rounded-none !important;
  }

  :deep(.prose-code-header) {
    @apply hidden;
  }

  :deep(pre) {
    @apply mt-0 !important;
  }

  :deep(.filename) {
    @apply hidden;
  }
}

.code-group-content {
  @apply rounded-b-lg;

  .preview-canvas {
    @apply u-bg-gray-50 z-0 my-0 overflow-x-auto rounded-bl-lg rounded-br-lg p-4 leading-normal text-gray-800 dark:text-gray-200;

    & > * {
      @apply my-0;
    }
  }
}
</style>
