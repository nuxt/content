<template>
  <h2 :id="id">
    <NuxtLink :href="`#${id}`">
      <slot />
    </NuxtLink>
  </h2>
</template>

<script setup lang="ts">
defineProps<{ id: string }>()
</script>
