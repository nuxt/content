<script setup lang="ts">
// `items` is a frontmatter array of relative asset paths, already rewritten to
// absolute public URLs at build time.
defineProps<{ items?: string[] }>()
</script>

<template>
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
    <img
      v-for="(src, index) in items"
      :key="index"
      :src="src"
      :alt="`Gallery image ${index + 1}`"
      style="max-width: 160px; height: auto; border-radius: 6px;"
    >
  </div>
</template>
