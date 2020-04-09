<template>
  <div>
    <nuxt-link to="/">Home</nuxt-link>
    <h1>{{ error.message }}</h1>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      required: true
    }
  },
  head () {
    return {
      title: this.error.message
    }
  }
}
</script>
