<template>
  <div>
    <h1>{{ page.metadata.title }}</h1>
    <nuxt-link to="/articles">Articles</nuxt-link>
    <pre>{{ page.body }}</pre>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('home').fetch()

    return { page }
  }
}
</script>
