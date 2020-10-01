<template>
  <div>
    <nuxt-link to="/articles">Articles</nuxt-link>
    <h2>{{ article.title }}</h2>
    <div v-for="author of authors" :key="author.slug">
      <img :src="author.avatarUrl" width="50" height="50" />
      {{ author.name }}
    </div>
    <nuxt-content :document="article" />
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
      return error({ message: 'Article not found' })
    }

    const authors = await $content('authors').where({ slug: { $in: article.authors } }).fetch()

    const [prev, next] = await $content('articles')
      .only(['title', 'slug'])
      .sortBy('date', 'desc')
      .surround(params.slug)
      .fetch()

    return {
      article,
      authors,
      prev,
      next
    }
  },
  head () {
    return {
      title: this.article.title,
      description: this.article.description
    }
  }
}
</script>
