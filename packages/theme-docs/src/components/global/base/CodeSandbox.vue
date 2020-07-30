<template>
  <div
    class="codesandbox w-full mb-6 mx-auto bg-black text-white text-3xl text-center flex items-center justify-center overflow-hidden rounded-md"
  >
    <iframe
      v-if="isIntersecting && src"
      :src="src"
      title="CodeSandbox editor"
      sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
      class="w-full overflow-hidden"
    />
    <span v-else>Loading CodeSandbox...</span>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      isIntersecting: false
    }
  },
  mounted () {
    if (!window.IntersectionObserver) {
      this.isIntersecting = true
      return
    }

    this.__observer = new window.IntersectionObserver((entries) => {
      entries.forEach(({ intersectionRatio, target: el }) => {
        if (intersectionRatio > 0) {
          this.isIntersecting = true
          this.__observer.disconnect()
          delete this.__observer
        }
      })
    })
    this.__observer.observe(this.$el)
  },
  beforeDestroy () {
    if (this.__observer) {
      this.__observer.disconnect()
      delete this.__observer
    }
  }
}
</script>

<style scoped>
.codesandbox,
.codesandbox iframe {
  @apply w-full rounded-md overflow-hidden h-64;
  height: 500px;
}
</style>
