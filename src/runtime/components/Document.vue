<script setup lang="ts">
import { watch } from '#imports'

const {
  value,
  excerpt = 'false',
  tag = 'div'
} = defineProps<{
  value?: ParsedContent
  excerpt?: boolean
  tag?: string
}>()

watch(
  () => excerpt,
  (newExcerpt) => {
    if (newExcerpt && !document.excerpt) {
      // eslint-disable-next-line no-console
      console.warn(`No excerpt found for document content/${value.path}.${value.extension}!`)
      // eslint-disable-next-line no-console
      console.warn('Make sure to use <!--more--> in your content if you want to use excerpt feature.')
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <MarkdownRenderer v-if="value?.type === 'markdown'" :document="value" :excerpt="excerpt" :tag="tag" />
  <pre v-else>{{ document }}</pre>
</template>
