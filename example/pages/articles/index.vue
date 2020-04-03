<template>
  <div>
    <h1>Articles</h1>
    <nuxt-link to="/">Home</nuxt-link>
    <ul>
      <li v-for="(article, index) in articles" :key="index">
        <nuxt-link :to="article.path">{{ article.title }}</nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const articles = await $content('articles').limit(2).sortBy('title', 'desc').fetch()

    return { articles }
  }
}
</script>
