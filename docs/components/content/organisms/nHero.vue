<script setup lang="ts">
defineProps({
  tag: {
    type: [Boolean, String],
    default: false
  },
  icon: {
    type: String,
    default: 'heroicons-solid:sparkles'
  }
})
</script>

<template>
  <div class="md:w-3/4 lg:w-2/3 mx-auto flex flex-col text-center py-4">
    <p v-if="tag" class="flex items-center justify-center gap-x-2 pt-4 font-semibold text-green-500 dark:text-green-400">
      <Icon :name="icon" class="h-4 w-4 text-amber-400 -scale-x-100" />
      {{ tag }}
      <Icon :name="icon" class="h-4 w-4 text-amber-400" />
    </p>
    <h2 class="font-semibold text-3xl sm:text-4xl lg:text-5xl py-4 lg:leading-tight">
      <Markdown use="title" unwrap />
    </h2>
    <p v-if="$slots.description" class="text-lg text-gray-400 dark:text-gray-300 py-4">
      <Markdown use="description" unwrap />
    </p>
  </div>
</template>
