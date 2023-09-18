<script lang="ts">
import TabsHeader from '@nuxt-themes/elements/components/globals/TabsHeader.vue'

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
    const slots = this.$slots?.default?.() || []
    const tabs = slots
      .map((slot, index) => {
        return {
          label: slot?.props?.filename || slot?.props?.label || `${index}`,
          active: slot?.props?.active || false,
          component: slot
        }
      })

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
                  display: index === this.activeTabIndex ? 'block' : 'none',
                  padding: isTag(slot, 'pre') ? '1rem' : '0'
                },
                class: {
                  '': !isTag(slot, 'pre')
                }
              },
              // Display direct children if not a ```code``` block
              [
                isTag(slot, 'code') || isTag(slot, 'pre')
                  ? slot
                  : h(
                    'div',
                    {
                      class: {
                        'preview-canvas': true
                      }
                    },
                    [(slot.children as any)?.default?.() || slot.children]
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

<style scoped lang="ts">
css({
  '.code-group': {
    border: '1px solid {elements.border.secondary.static}',
    borderRadius: '{radii.md}',
    overflow: 'hidden',
    ':deep(.prose-code)': {
      margin: 0,
      border: 'none',
      borderRadius: 0,
    },
    ':deep(.filename)': {
      display: 'none'
    },
    '.preview-canvas': {
      padding: '{space.4}',
      '&:has(.sandbox)': {
        padding: 0,
        ':deep(.sandbox)': {
          border: 0,
          borderRadius: 0
        }
      }
    }
  }
})
</style>
