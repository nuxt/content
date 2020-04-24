<template>
  <div
    class="flex justify-center items-center w-full h-full"
    :style="style"
    @click.left="forward"
    @click.right.prevent="previous"
  >
    <nuxt-content :document="slide" />
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params }) {
    const name = params.slide || 'index'
    const slide = await $content(name).fetch()

    const [prev, next] = await $content()
      .only(['title', 'slug'])
      .sortBy('position')
      .surround(name, { before: 1, after: 1 })
      .fetch()

    return {
      slide,
      prev,
      next
    }
  },
  computed: {
    style () {
      return {
        color: this.slide.color || 'currentColor',
        backgroundColor: this.slide.backgroundColor || 'transparent'
      }
    }
  },
  mounted () {
    window.addEventListener('keyup', this.keyup)
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.keyup)
  },
  methods: {
    previous () {
      if (this.prev) {
        const slide = this.prev.slug === 'index' ? undefined : this.prev.slug

        this.$router.push({ name: 'slide', params: { slide, transition: 'slide-right' } })
      }
    },
    forward () {
      if (this.next) {
        this.$router.push({ name: 'slide', params: { slide: this.next.slug, transition: 'slide-left' } })
      }
    },
    keyup (e) {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          this.forward()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          this.previous()
          break
      }
    }
  },
  transition (to) {
    return to.params.transition
  }
}
</script>
