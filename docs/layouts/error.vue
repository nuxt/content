<template>
  <div class="p-4 lg:p-8 text-center">
    <h1 class="text-4xl font-black leading-none">{{ error.message }}</h1>
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
