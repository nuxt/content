<template>
  <MDCSlot :use="use" :unwrap="unwrap" />
</template>

<script setup lang="ts">
defineProps({
  /**
    * A slot name or function
    */
  use: {
    type: Function,
    default: undefined
  },
  /**
   * Tags to unwrap separated by spaces
   * Example: 'ul li'
   */
  unwrap: {
    type: [Boolean, String],
    default: false
  }
})
</script>
