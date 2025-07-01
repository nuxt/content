<template>
  <div class="w-fit rounded-xl border border-muted shadow-md overflow-hidden">
    <div class="flex justify-between items-center px-2 py-2 bg-accented border-accented border-b">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 bg-red-500 rounded-full" />
        <span class="w-3 h-3 bg-yellow-500 rounded-full" />
        <span class="w-3 h-3 bg-green-500 rounded-full" />
      </div>
      <div class="text-muted">
        {{ title }}
      </div>
    </div>
    <div class="p-4">
      <slot mdc-unwrap="p" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
