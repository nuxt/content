<script setup>
defineProps(['type'])
</script>

<template>
  <div class="alert" :class="[type]">
    <ContentSlot :use="$slots.default" unwrap="p" />
  </div>
</template>

<style scoped lang="postcss">
.alert {
  @apply text-black p-2 border dark:text-white rounded;
}
.warning {
  @apply bg-orange-100 border-orange-200 dark:bg-orange-900 dark:border-orange-800;
}
</style>
