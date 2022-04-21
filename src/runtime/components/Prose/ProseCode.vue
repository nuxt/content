<script setup lang="ts">
defineProps({
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: null
  },
  filename: {
    type: String,
    default: null
  },
  highlights: {
    type: Array as () => number[],
    default: () => []
  }
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>

<style scoped>
div {
  display: flex;
  color: #d4d4d4;
}

:deep(pre) {
  flex: 1 1 0%;
  background-color: #2e3440;
  padding: 1rem 0;
}

:deep(code) {
  display: flex;
  flex-direction: column;
}

:deep(.line) {
  display: inline-table;
  min-height: 15px;
  padding: 0 1rem;
}

:deep(.line.highlight) {
  background-color: #3f3f46;
}
</style>
