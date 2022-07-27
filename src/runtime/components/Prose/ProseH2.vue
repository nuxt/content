<template>
  <h2 :id="id">
    <a :href="`#${id}`">
      <slot />
    </a>
  </h2>
</template>

<script setup lang="ts">
defineProps<{ id: string }>()
</script>
