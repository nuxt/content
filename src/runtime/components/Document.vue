<script setup lang="ts">
// defineEmits(['update:modelValue'])
const { modelValue: document, excerpt } = defineProps({
  modelValue: {
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

if (excerpt && !document.excerpt) {
  // eslint-disable-next-line no-console
  console.warn(`No excerpt found for document content/${document.path}.${document.extension}. Make sure to use <!--more--> in your content.`)
}
</script>

<template>
  <MarkdownRenderer v-if="modelValue?.type === 'markdown'" :document="modelValue" :excerpt="excerpt" :tag="tag" />
  <pre v-else>{{ modelValue }}</pre>
</template>
