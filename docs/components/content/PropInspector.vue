<script setup>
import { computed } from 'vue'
// eslint-disable-next-line vue/require-prop-types
const props = defineProps(['prop'])
const propType = computed(() => Array.isArray(props.prop) ? 'array' : typeof props.prop)
</script>

<template>
  <pre>
Type: {{ propType }}
Value:
{{ prop }}
    </pre>
</template>

<style scoped>
pre {
  padding: 1rem 1rem 0 1rem;
  border-radius: 4px;
}
</style>
