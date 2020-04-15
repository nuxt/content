<template>
  <div>
    <main>
      <nuxt />
    </main>

    <footer class="flex items-center justify-center py-8 px-4 text-gray-600 dark:text-gray-200">
      Copyright © {{ new Date().getFullYear() }}. Powered by&nbsp;
      <a
        href="https://nuxtjs.org"
        target="_blank"
        class="underline hover:text-gray-700 dark-hover:text-gray-400"
      >Nuxt.js</a>
    </footer>
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
        class: ['bg-gray-100 dark:bg-gray-800 antialiased']
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
