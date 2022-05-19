<script setup>
defineProps({
  type: {
    type: String,
    default: 'info'
  }
})
</script>

<template>
  <button :class="type">
    <Markdown unwrap="p" />
  </button>
</template>

<style scoped>
  button {
    padding: .5rem;
    border-radius: 4px;
    color: #000;
  }
  .info {
    background-color: blue
  }
  .warning {
    background-color: orange
  }
  .success {
    background-color: rgb(209, 250, 229);
    border: 1px solid rgb(52, 211, 153)
  }
</style>
