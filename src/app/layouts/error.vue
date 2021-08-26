<template>
  <Component :is="template" :error="error" />
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      template: 'PageError'
    }
  },
  head() {
    return {
      title: this.error.message
    }
  }
}
</script>
