<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'

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

const content = ref<ParsedContent | null>(null)
const type = computed(() => content.value?.meta?.type)

watchEffect(async () => {
  content.value = await getContent(props.id)
})
</script>

<template>
  <ContentRendererMarkdown v-if="type === 'markdown'" :document="content" />
  <ContentRendererYaml v-else-if="type === 'yaml'" :document="content" />
</template>
