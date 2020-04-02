<template>
  <div v-if="article">
    <h1>{{ article.metadata.title }}</h1>
    <pre>{{ article.body }}</pre>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params, error }) {
    try {
      const article = await $content('articles', params.slug).fetch()
      // OR const article = await $content(`articles/${params.slug}`).fetch()

      return { article }
    } catch (err) {
      error({ message: 'Article not found' })
    }
  }
}
</script>
