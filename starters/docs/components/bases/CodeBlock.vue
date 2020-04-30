<template>
  <div class="code-block">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      active: false
    }
  }
}
</script>

<style scoped>
.code-block {
  display: none;
}
.code-block.active {
  display: block;
}
</style>
