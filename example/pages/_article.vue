<template>
  <div v-if="article">
    <h1>{{ article.metadata.title }}</h1>
    <pre>{{ article.body }}</pre>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, route, error }) {
    const articles = await $content('articles', route.params.article).data()

    if (!articles.length) {
      return error({ message: 'Page not found' })
    }

    return {
      article: articles[0]
    }
  }
}
</script>
