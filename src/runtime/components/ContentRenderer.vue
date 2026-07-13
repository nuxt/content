<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import { ComarkRenderer, type ComarkTree } from '@comark/vue'
import type { ComarkRendererProps } from '@comark/vue/components/ComarkRenderer'

const debug = import.meta.dev || import.meta.preview

const props = defineProps({
  /**
   * Content to render
   *
   * @deprecated Use `tree` instead.
   */
  value: {
    type: Object as PropType<{ body: ComarkRendererProps['tree']['nodes'] }>,
    default: undefined,
  },
  /**
   * Content to render
   */
  tree: {
    type: Object as PropType<ComarkRendererProps['tree']>,
    default: undefined,
  },
  /**
   * Custom component mappings for element tags
   */
  components: {
    type: Object as PropType<ComarkRendererProps['components']>,
    default: undefined,
  },
  /**
   * Additional data made available to the rendered tree (e.g. for binding
   * frontmatter/props).
   */
  data: {
    type: Object as PropType<ComarkRendererProps['data']>,
    default: undefined,
  },
})

const comarkTree = computed(() => {
  if (props.tree) return props.tree
  if (props.value) {
    const { body, id, path, ...rest } = (props.value || {}) as any
    return {
      path,
      nodes: body,
      frontmatter: rest,
      meta: {
        id,
      },
    }
  }
  return undefined
})
const isEmpty = computed(() => !comarkTree.value)
</script>

<template>
  <slot
    v-if="isEmpty"
    name="empty"
    :data-content-id="debug ? (comarkTree as ComarkTree)?.meta?.key : undefined"
  >
    <!-- nobody -->
  </slot>
  <ComarkRenderer
    v-else
    :tree="comarkTree!"
    :components="props.components"
    :data="props.data"
    :data-content-id="debug ? (comarkTree as ComarkTree)?.meta?.key : undefined"
  />
</template>
