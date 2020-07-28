<template>
  <img ref="img" :src="src" :alt="alt" />
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      default: null
    }
  },
  data () {
    return {
    }
  },
  computed: {
    src () {
      return this.url
    }
  },
  methods: {
  }
}
</script>
