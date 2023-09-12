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
  <NuxtLink :to="to" class="link">
    <Icon name="heroicons-solid:sparkles" class="icon" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<style scoped></style>
