<template>
  <img :src="src" :alt="alt" :width="width" :height="height" />
</template>

<script lang="ts">
export default {
  props: {
    src: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: ''
    },
    width: {
      type: [String, Number],
      default: undefined
    },
    height: {
      type: [String, Number],
      default: undefined
    }
  }
}
</script>
