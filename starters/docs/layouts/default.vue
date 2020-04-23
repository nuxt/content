<template>
  <div>
    <navbar />

    <main class="container mx-auto px-4 lg:px-8">
      <nuxt />
    </main>
  </div>
</template>

<script>
import Navbar from '~/components/navbar'

export default {
  components: {
    Navbar
  },
  head () {
    return {
      title: '',
      titleTemplate: (chunk) => {
        if (chunk) {
          return `${chunk} - Nuxt Content`
        }

        return 'Nuxt Content'
      },
      bodyAttrs: {
        class: ['bg-white dark:bg-gray-900 text-gray-700 dark:text-white antialiased lg:pt-16']
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
