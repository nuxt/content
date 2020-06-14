<template>
  <div>
    <h1>{{ page.title }}</h1>
    <nuxt-content :document="page" />
  </div>
</template>

<script>
import AppLayout from '../components/AppLayout'

export default {
  components: {
    AppLayout // eslint-disable-line vue/no-unused-components
  },
  async asyncData ({ $content, params }) {
    const page = await $content(params.slug || 'home').fetch()

    return {
      page
    }
  }
}
</script>
