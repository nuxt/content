<template>
  <div>
    <nuxt-link to="/articles">Articles</nuxt-link>
    <h2>{{ article.title }}</h2>
    <p>{{ article.description }}</p>

    <n-content :body="article.body" />

    <nuxt-link
      v-if="prev"
      :to="{ name: 'articles-slug', params: { slug: prev.slug } }"
    >&lt; {{ prev.title }}</nuxt-link>&nbsp;|
    <nuxt-link
      v-if="next"
      :to="{ name: 'articles-slug', params: { slug: next.slug } }"
    >{{ next.title }} &gt;</nuxt-link>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params, error }) {
    let article

    try {
      article = await $content('articles', params.slug).fetch()
      // OR const article = await $content(`articles/${params.slug}`).fetch()
    } catch (e) {
      error({ message: 'Article not found' })
    }

    const [prev, next] = await $content('articles')
      .fields(['title', 'slug'])
      .sortBy('date', 'desc')
      .surround(params.slug)
      .fetch()

    return {
      article,
      prev,
      next
    }
  }
}
</script>
