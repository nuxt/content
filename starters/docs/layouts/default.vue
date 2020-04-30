<template>
  <div class="pt-16">
    <Navbar />
    <main class="container mx-auto px-4 lg:px-8">
      <Nuxt />
    </main>
  </div>
</template>

<script>
import Navbar from '~/components/Navbar'

export default {
  components: {
    Navbar
  },
  computed: {
    bodyClass () {
      return this.$store.state.menu.open ? ['h-screen lg:h-auto overflow-y-hidden lg:overflow-y-auto'] : []
    }
  },
  head () {
    const i18nSeo = this.$nuxtI18nSeo()

    return {
      title: '',
      titleTemplate: (chunk) => {
        if (chunk) {
          return `${chunk} - Nuxt Content`
        }

        return 'Nuxt Content'
      },
      bodyAttrs: {
        class: [...this.bodyClass, 'antialiased text-gray-800 leading-normal bg-white dark:bg-gray-900 dark:text-gray-100']
      },
      ...i18nSeo
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
