<template>
  <div>
    <nav class="flex items-center justify-center text-sm leading-5 font-medium">
      <nuxt-link
        to="/"
        class="text-gray-500 hover:text-gray-700 focus:outline-none focus:underline transition duration-150 ease-in-out"
      >Home</nuxt-link>
    </nav>
    <div class="mt-2 text-center">
      <h2
        class="text-3xl leading-9 tracking-tight font-extrabold text-gray-900 sm:text-4xl sm:leading-10"
      >Nuxt.js Blog</h2>
      <p
        class="mt-3 max-w-2xl mx-auto text-xl leading-7 text-gray-500 sm:mt-4"
      >Discover articles from the core team and contributors about NuxtJS, tips and tricks included!</p>
    </div>
    <div class="mt-3">
      <div class="relative rounded-md shadow-sm">
        <input
          id="search"
          v-model="q"
          class="form-input block w-full sm:text-sm sm:leading-5"
          placeholder="Search..."
        />
      </div>
    </div>
    <div class="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
      <article-list v-for="article in articles" :key="article.slug" :article="article" />
    </div>
  </div>
</template>

<script>
import ArticleList from './components/-article'

export default {
  components: {
    ArticleList
  },
  watchQuery: true,
  async asyncData ({ $content, route }) {
    const q = route.query.q

    let query = $content('articles')
      .sortBy('date', 'desc')

    if (q) {
      query = query.search(q)
      // OR query = query.search('title', q)
    }

    const articles = await query.fetch()

    return {
      q,
      articles
    }
  },
  watch: {
    q () {
      this.$router.replace({ query: this.q ? { q: this.q } : undefined }).catch(() => { })
    }
  },
  head () {
    return {
      title: 'Blog'
    }
  }
}
</script>
