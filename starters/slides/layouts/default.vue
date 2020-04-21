<template>
  <div class="flex w-full h-screen">
    <ColorMode />
    <nuxt />
  </div>
</template>

<script>
import ColorMode from '@/components/ColorMode'

export default {
  components: {
    ColorMode
  },
  head () {
    return {
      bodyAttrs: {
        class: ['bg-white dark:bg-gray-900 text-gray-700 dark:text-white antialiased']
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
