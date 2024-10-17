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
    class="p-4 border rounded-b-md border-[--ui-color-neutral-200] dark:border-[--ui-color-neutral-700] bg-[--ui-color-neutral-50] dark:bg-[--ui-color-neutral-800] dark:text-white"
    :class="prose ? 'prose' : 'not-prose'"
  >
    <slot />
  </div>
</template>
