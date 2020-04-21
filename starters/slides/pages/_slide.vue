<template>
  <div
    class="flex justify-center items-center w-full h-full"
    :style="style"
    @click.left="forward"
    @click.right.prevent="previous"
  >
    <nuxt-content :body="slide.body" />
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params }) {
    const name = params.slide || 'index'
    const slide = await $content(name).fetch()

    const [prev, next] = await $content()
      .fields(['title', 'slug'])
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
    window.addEventListener('keyup', this.keypress)
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.keypress)
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
    keypress (e) {
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
