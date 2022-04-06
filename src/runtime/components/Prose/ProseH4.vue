<template>
  <h4 :id="id">
    <NuxtLink :href="`#${id}`">
      <slot />
    </NuxtLink>
  </h4>
</template>

<script setup lang="ts">
defineProps<{ id: string }>()
</script>
