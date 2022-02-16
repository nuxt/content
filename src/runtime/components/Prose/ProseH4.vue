<template>
  <h4 :id="id">
    <a :href="`#${id}`">
      <slot />
    </a>
  </h4>
</template>

<script setup lang="ts">
defineProps<{ id: string }>()
</script>
