<template>
  <span>Hello {{ name }}</span>
</template>

<script>
export default {
  name: 'Hello',
  props: {
    name: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
