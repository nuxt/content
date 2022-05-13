<script setup lang="ts">
import { useHead, useRoute, watch, computed, useAsyncData, queryContent } from '#imports'

const {
  path = useRoute().path,
  tag = 'div'
} = defineProps<{
  path?: string
  tag?: string
}>()

const isPartial = computed(() => path.includes('/_'))

const { data: document } = await useAsyncData(`content-doc-${path}`, () => queryContent().where({ path, partial: isPartial.value }).findOne())

watch(
  () => document,
  (newDoc) => {
    if (!newDoc) { return }

    const { path, head = {}, partial = false, description } = newDoc

    // Head management (only if doc = route path)
    if (path && path === useRoute().path && !partial) {
      head.title = head.title || document.value.title
      head.meta = head.meta || []

      if (description && head.meta.filter(m => m.name === 'description').length === 0) {
        head.meta.push({
          name: 'description',
          content: document.value.description
        })
      }

      useHead(head)
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <Document :value="document" :tag="tag">
    <slot name="empty" />
  </Document>
</template>
