<script setup lang="ts">
defineProps({
  document: {
    type: Object,
    required: true
  },
  excerpt: {
    type: Boolean,
    default: false
  },
  tag: {
    type: String,
    default: 'div'
  }
})
</script>

<template>
  <ContentRendererMarkdown v-if="document?.type === 'markdown'" :document="document" :excerpt="excerpt" :tag="tag" />
  <pre v-else>{{ document }}</pre>
</template>
