<script setup lang="ts">
import { computed } from 'vue'
import { useContent } from '#imports'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: 'div'
  }
})

const content = await useContent(props.id)
const type = computed(() => content.value?.meta?.type)
</script>

<template>
  <ContentRendererMarkdown v-if="type === 'markdown'" :document="content" />
  <ContentRendererYaml v-else-if="type === 'yaml'" :document="content" />
</template>
