<script setup lang="ts">
defineProps({
  to: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md'
  }
})
</script>

<template>
  <UButton color="primary" :to="to" :label="label" :icon="icon" :size="size" />
</template>
