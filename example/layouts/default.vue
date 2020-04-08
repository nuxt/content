<template>
  <div class="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8 min-h-screen">
    <div class="relative max-w-7xl mx-auto">
      <nuxt />
    </div>
  </div>
</template>

<script>
export default {
  head () {
    return {
      title: '',
      titleTemplate: (chunk) => {
        if (chunk) {
          return `${chunk} - NuxtJS`
        }

        return 'NuxtJS'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
