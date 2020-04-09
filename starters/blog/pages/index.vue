<template>
  <div>
    <header
      class="px-8 flex items-center justify-between sticky top-0 h-20 border-b border-gray-300 lg:border-b-0 bg-gray-100 lg:bg-transparent"
    >
      <input
        id="search"
        v-model="q"
        class="bg-white dark:bg-gray-700 w-full lg:w-64 focus:outline-none border border-gray-300 dark:border-gray-800 dark:text-white rounded py-2 px-4 block appearance-none leading-normal"
        placeholder="Search..."
      />

      <div class="ml-8">
        <button
          class="text-gray-800 hover:text-gray-600 dark:text-white dark-hover:text-gray-400 focus:outline-none"
          @click="theme === 'dark' ? theme = 'light' : theme = 'dark'"
        >
          <svg
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            class="w-6 h-6"
          >
            <path
              v-if="theme === 'dark'"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
            <path
              v-else
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
      </div>
    </header>

    <div class="max-w-4xl mx-auto py-16 px-4">
      <div class="text-center mb-16 max-w-xl mx-auto">
        <img :src="`/img/logo-${theme}.svg`" class="w-24 h-24 mx-auto mb-4" />
        <h2 class="text-3xl font-extrabold mb-2 dark:text-white">Nuxt.js Blog Starter</h2>
        <p class="text-xl font-light text-gray-700 dark:text-gray-400 mb-4">
          A simple, hackable & minimalistic starter for
          <a
            href="https://nuxtjs.org"
            target="_blank"
            class="text-lg hover:underline text-green-500"
          >Nuxt.js</a> that uses Markdown for content and
          <a
            href="https://tailwindcss.com"
            target="_blank"
            class="text-lg hover:underline text-green-500"
          >TailwindCSS</a>.
        </p>
        <a
          href="https://github.com/nuxt-company/content-module"
          target="_blank"
          class="text-lg font-medium hover:underline text-green-500"
        >GitHub</a>
      </div>

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
  computed: {
    theme: {
      get () {
        return this.$store.state.theme
      },
      set (theme) {
        this.$store.commit('setTheme', theme)
      }
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
