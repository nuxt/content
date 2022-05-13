<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: 'uil:icons'
  }
})
</script>

<template>
  <div>
    <div class="transition-all h-32 w-32 mx-auto flex justify-center items-center text-green-500 dark:text-green-400 border-double border-4 border-gray-100 dark:border-gray-600 rounded-full p-4">
      <Icon :name="icon" class="h-16 w-16 mx-auto" />
    </div>
    <h3 class="text-xl text-center font-semibold py-4">
      <Markdown use="title" unwrap />
    </h3>
    <p class="text-gray-400 dark:text-gray-300 text-justify">
      <Markdown use="description" unwrap />
    </p>
  </div>
</template>
