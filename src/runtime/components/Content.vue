<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useContentDocument } from '#imports'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const content = await useContentDocument(toRef(props, 'id'))
const type = computed(() => content.value?.meta?.type)
</script>

<template>
  <ContentRendererMarkdown v-if="type === 'markdown'" :document="content" />
  <ContentRendererYaml v-else-if="type === 'yaml'" :document="content" />
</template>
