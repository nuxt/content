<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'lg',
})

// this is just for testing, will update to something better
const calcWidth = computed(() => props.size === 'sm' ? '75px' : undefined)
</script>

<template>
  <div
    class="text-sm border-b border-r border-gray-400/20 px-4 py-2 w-full"
    :style="{ 'min-width': calcWidth ? calcWidth : '250px', 'width': calcWidth }"
  >
    <slot>
      <span
        v-if="data"
        class="block truncate max-w-72"
      >
        {{ data }}
      </span>
      <span
        v-else
        class="text-neutral-400/40"
      >
        NULL
      </span>
    </slot>
  </div>
</template>
