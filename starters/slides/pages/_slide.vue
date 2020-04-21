<template>
  <div class="flex justify-center items-center w-full h-full" :style="style" @click.left="forward" @click.right.prevent="previous">
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
  methods: {
    previous () {
      if (this.prev) {
        this.$router.push(this.prev.slug === 'index' ? '/' : this.prev.slug)
      }
    },
    forward () {
      if (this.next) {
        this.$router.push(this.next.slug)
      }
    }
  }
}
</script>
