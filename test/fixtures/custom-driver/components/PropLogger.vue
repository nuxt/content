<template>
  <div>
    <div class="prop-a">
      {{ a }}
    </div>
    <div class="prop-b">
      {{ b }}
    </div>
    <div class="prop-c">
      {{ c }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  a: {
    type: String,
    default: 'EMPTY'
  },
  b: {
    type: String,
    default: 'EMPTY'
  },
  c: {
    type: String,
    default: 'EMPTY'
  }
})
</script>
