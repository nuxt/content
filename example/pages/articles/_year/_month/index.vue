<template>
  <div>
    <nuxt-link to="/articles">Articles</nuxt-link>
    <h2>{{ year }}/{{ month }}</h2>

    <ul>
      <li v-for="article in articles" :key="article.slug">
        <nuxt-link :to="article.path">{{ article.title }}</nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  watchQuery: true,
  async asyncData ({ $content, route, params }) {
    const { year, month } = params

    const articles = await $content('articles', year, month)
      .sortBy('date', 'desc')
      .fetch()

    return {
      articles,
      year,
      month
    }
  }
}
</script>
