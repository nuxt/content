<template>
  <div>
    <nuxt-link :to="{ name: 'articles' }">Articles</nuxt-link>

    <md-content :body="page.body" />
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('home').fields(['title', 'body']).fetch()

    return {
      page
    }
  }
}
</script>
