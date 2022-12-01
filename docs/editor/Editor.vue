<template>
  <Monaco :value="readOnly? modelValue : raw" :language="language" :read-only="readOnly" @change="update" />
</template>

<script setup lang="ts">
import Monaco from './Monaco.vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'mdc'
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const raw = ref(props.modelValue)

const emit = defineEmits(['update:modelValue'])

function update (content: string) {
  emit('update:modelValue', content)
}
</script>
