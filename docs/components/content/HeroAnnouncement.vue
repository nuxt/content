<script setup>
defineProps({
  to: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <NuxtLink :to="to" class="hover:bg-primary-200 text-primary-900 bg-primary-100 transition dark:bg-transparent hover:dark:bg-primary-900 dark:border-primary-700 dark:text-primary-100 border border-primary-400 mb-8 px-4 py-2 rounded-md flex gap-x-1 inline-flex items-center justify-center">
    <Icon name="heroicons-solid:sparkles" class="h-4 w-4" />
    <span class="font-medium text-sm">{{ label }}</span>
  </NuxtLink>
</template>
