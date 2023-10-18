<script setup>
defineProps({
  prose: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="p-4 border dark:bg-gray-800 dark:border-gray-700 dark:text-white" :class="prose ? 'prose' : 'not-prose'">
    <slot />
  </div>
</template>
