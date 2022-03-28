<script setup lang="ts">
defineProps({
  document: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <ContentRendererMarkdown v-if="document?.type === 'markdown'" :document="document" />
  <ContentRendererYaml v-else-if="document?.type === 'yaml'" :document="document" />
  <pre v-else>{{ document }}</pre>
</template>
