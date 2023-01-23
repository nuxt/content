<template>
  <div>
    <ContentRendererMarkdown :value="data" />
  </div>
</template>

<script setup>
import { useRoute, useAsyncData } from '#imports'

const { content } = useRoute().query
const { data } = await useAsyncData(content, async () => {
  return await $fetch('/api/parse', {
    method: 'POST',
    cors: true,
    body: {
      id: 'content:index.md',
      content: decodeURIComponent(content)
    }
  })
})
</script>
