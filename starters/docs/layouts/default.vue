<template>
  <div>
    <main>
      <nuxt />
    </main>
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
      },
      bodyAttrs: {
        class: ['bg-white dark:bg-gray-800 text-gray-700 dark:text-white antialiased']
      },
      htmlAttrs: {
        class: this.$store.state.theme === 'dark' ? ['mode-dark'] : []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
