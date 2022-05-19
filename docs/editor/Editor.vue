<template>
  <Monaco :value="raw" :language="language" @change="update" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Monaco from './Monaco.vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const raw = ref(props.modelValue)

const emit = defineEmits(['update:modelValue'])

const language = computed(() => {
  return 'markdown'
})

function update (content) {
  emit('update:modelValue', content)
}
</script>
