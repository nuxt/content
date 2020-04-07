<template>
  <div class="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8 min-h-screen">
    <div class="relative max-w-5xl mx-auto">
      <nav class="flex items-center justify-center text-sm leading-5 font-medium">
        <svg
          class="flex-shrink-0 -ml-1 mr-1 h-5 w-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <nuxt-link
          to="/articles"
          class="text-gray-500 hover:text-gray-700 focus:outline-none focus:underline transition duration-150 ease-in-out"
        >Back to articles</nuxt-link>
      </nav>
      <div class="mt-2 text-center">
        <h2
          class="text-3xl leading-9 tracking-tight font-extrabold text-gray-900 sm:text-4xl sm:leading-10"
        >{{ article.title }}</h2>
        <p class="mt-3 mx-auto text-xl leading-7 text-gray-500 sm:mt-4">{{ article.description }}</p>
      </div>
      <div class="mt-6 flex items-center justify-between">
        <div class="flex items-center flex-shrink-0">
          <a :href="article.authors[0].link" class="hover:underline flex items-center">
            <img class="h-6 w-6 mr-3 rounded-full" :src="article.authors[0].avatarUrl" alt />
            {{ article.authors[0].name }}
          </a>
        </div>
        <div class="flex text-sm leading-5 text-gray-500">
          <time datetime="2020-03-16">{{ $moment(article.date).format('LL') }}</time>
          <span class="mx-1">&middot;</span>
          <span>{{ article.time }} min read</span>
        </div>
      </div>
      <div class="bg-white overflow-hidden shadow rounded-lg mt-6">
        <img class="h-64 w-full object-cover" :src="`https://nuxtjs.org/${article.imgUrl}`" alt />
        <div class="px-4 py-5 sm:p-6">
          <nuxt-content :body="article.body" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params, error }) {
    try {
      const article = await $content('articles', params.slug).fetch()
      // OR const article = await $content(`articles/${params.slug}`).fetch()

      return {
        article
      }
    } catch (err) {
      error({ message: 'Article not found' })
    }
  },
  head () {
    return {
      title: this.article.title
    }
  }
}
</script>

<style lang="scss">
.nuxt-content {
  @apply leading-loose;

  h2 {
    @apply text-xl font-bold my-6 table;

    &::after {
      content: " ";
      @apply w-4/5 block border-2 border-green-500 rounded mt-2;
    }
  }

  h3 {
    @apply text-lg font-medium my-6 table;

    &::after {
      content: " ";
      @apply w-4/5 block border-2 border-gray-500 rounded mt-2;
    }
  }

  code {
    @apply bg-gray-100 p-1 text-xs text-orange-500 rounded;
  }

  pre {
    @apply bg-gray-100 p-3 rounded;

    code {
      @apply bg-transparent p-0 text-sm text-black;
    }
  }

  ol {
    @apply list-decimal list-inside;

    > li {
      @apply py-2;
    }
  }
}
</style>
