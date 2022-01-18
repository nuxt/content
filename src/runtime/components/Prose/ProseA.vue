<script setup lang="ts">
defineProps({
  href: {
    type: String,
    default: ''
  },
  blank: {
    type: Boolean,
    default: false
  },
  /**
   * `true` if `href` points to a static file
   */
  static: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <a target="blank" :href="href"><slot /></a>
</template>
