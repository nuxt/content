<template>
  <h3 :id="id">
    <NuxtLink :href="`#${id}`">
      <slot />
    </NuxtLink>
  </h3>
</template>

<script setup lang="ts">
defineProps<{ id: string }>()
</script>
