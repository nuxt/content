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
    <ContentSlot :use="$slots.default" unwrap="p" />
  </button>
</template>

<style scoped lang="ts">
css({
  'button': {
    padding: '.5rem',
    borderRadius: '4px',
    color: '#000'
  },
  '.info': {
    'backgroundColor': 'blue'
  },
  '.warning': {
    'backgroundColor': 'orange'
  },
  '.success': {
    backgroundColor: 'rgb(209, 250, 229)',
    border: '1px solid rgb(52, 211, 153)'
  }

})
</style>
