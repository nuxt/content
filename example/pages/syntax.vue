<template>
  <div>
    <nuxt-link to="/">Home</nuxt-link>
    <h2 v-html="page.title" />
    <nuxt-content :body="page.body" />
  </div>
</template>

<script>

export default {
  async asyncData ({ $content }) {
    const page = await $content('syntax').fetch()

    return {
      page
    }
  }
}
</script>
