<template>
  <div>
    <nuxt-link to="/articles">Articles</nuxt-link>
    <h2>{{ article.title }}</h2>
    <p>{{ article.description }}</p>
    <nuxt-content :document="article" />
    <nuxt-link
      v-if="prev"
      :to="`${prev.dir}/${prev.slug}`"
    >&lt; {{ prev.title }}</nuxt-link>&nbsp;|
    <nuxt-link
      v-if="next"
      :to="`${next.dir}/${next.slug}`"
    >{{ next.title }} &gt;</nuxt-link>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params, error }) {
    let article

    const { year, month, slug } = params

    try {
      article = await $content('articles', year, month, slug).fetch()
      // OR const article = await $content(`articles/${year}/${month}/${slug}`).fetch()
    } catch (e) {
      error({ message: 'Article not found' })
    }

    const [prev, next] = await $content('articles')
      .only(['title', 'slug', 'dir'])
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
