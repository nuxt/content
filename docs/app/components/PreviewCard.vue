<script setup>
defineProps({
  prose: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    class="px-4 py-1 border rounded-b-md border-(--ui-border-muted) bg-(--ui-bg-muted) dark:text-white"
  >
    <slot />
  </div>
</template>
