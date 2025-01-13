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
    class="px-4 py-1 border rounded-b-md border-[var(--ui-color-neutral-200)] dark:border-[var(--ui-color-neutral-700)] bg-[var(--ui-color-neutral-50)] dark:bg-[var(--ui-color-neutral-800)] dark:text-white"
  >
    <slot />
  </div>
</template>
