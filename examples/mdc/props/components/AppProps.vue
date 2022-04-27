<template>
  <p>
    I'm feeling {{ icon }} today!
  </p>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: '🙂'
  }
})
</script>
