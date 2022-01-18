<script setup lang="ts">
defineProps<{
  document: string | object
}>()
</script>

<template>
  <pre>{{ document }}</pre>
</template>
