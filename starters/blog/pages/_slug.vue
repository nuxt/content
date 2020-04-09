<template>
  <div>
    <header class="px-8 flex items-center justify-between sticky top-0 h-20">
      <nuxt-link
        to="/"
        class="text-gray-800 hover:text-gray-600 dark:text-white dark-hover:text-gray-400 focus:outline-none focus:underline flex items-center transition duration-150 ease-in-out"
      >
        <svg class="flex-shrink-0 mr-1 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg> Nuxt.js Blog Starter
      </nuxt-link>

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
      <div class="text-center mb-16 max-w-2xl mx-auto">
        <h2 class="text-3xl font-extrabold dark:text-white mb-2">{{ article.title }}</h2>
        <p
          class="text-xl font-light text-gray-700 dark:text-gray-400 mb-4"
        >{{ article.description }}</p>
        <div class="flex justify-center text-gray-500">
          <time datetime="2020-03-16">{{ $moment(article.date).format('LL') }}</time>
          <span class="mx-1">&middot;</span>
          <span>{{ readingTime }} min read</span>
        </div>
      </div>

      <div class="relative">
        <div class="lg:absolute lg:right-0 lg:w-56 lg:-mr-64 mb-8 lg:mb-0 h-full lg:-mt-8">
          <div class="lg:sticky lg:top-0 lg:pt-8 lg:-mb-8">
            <div class="bg-white dark:bg-gray-700 dark:text-white overflow-hidden shadow rounded">
              <div class="p-6">
                <p class="font-bold mb-2">Table of Contents</p>

                <div class="-ml-8">
                  <scrollactive highlight-first-item active-class="text-green-500">
                    <a
                      v-for="link of article.toc"
                      :key="link.id"
                      :href="`#${link.id}`"
                      class="block mb-1 last:mb-0 text-sm font-light scrollactive-item"
                      :class="`ml-${link.depth * 4}`"
                    >{{ link.text }}</a>
                  </scrollactive>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col rounded shadow overflow-hidden mb-4">
          <div class="flex-shrink-0">
            <img class="w-full object-cover" :src="`https://nuxtjs.org/${article.imgUrl}`" alt />
          </div>

          <div class="flex-1 bg-white dark:bg-gray-700 p-8 flex flex-col justify-between">
            <n-content :body="article.body" />
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center mb-16">
        <nuxt-link
          v-if="prev"
          :to="`/${prev.slug}`"
          class="text-green-500 hover:underline flex items-center"
        >
          <svg fill="currentColor" viewBox="0 0 20 20" class="w-5 h-5 mr-2">
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          {{ prev.title }}
        </nuxt-link>
        <span v-else>&nbsp;</span>

        <nuxt-link
          v-if="next"
          :to="`/${next.slug}`"
          class="text-green-500 hover:underline flex items-center"
        >
          {{ next.title }}
          <svg fill="currentColor" viewBox="0 0 20 20" class="w-5 h-5 ml-2">
            <path
              fill-rule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </nuxt-link>
        <span v-else>&nbsp;</span>
      </div>

      <div class="text-center max-w-xl mx-auto">
        <img :src="article.authors[0].avatarUrl" class="w-24 h-24 mx-auto mb-4 rounded-full" />
        <h2 class="text-3xl font-bold mb-2 dark:text-white">{{ article.authors[0].name }}</h2>
        <a
          :href="article.authors[0].link"
          target="_blank"
          class="text-lg font-medium hover:underline text-green-500"
        >Twitter</a>
      </div>
    </div>
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
      .surround(params.slug, { before: 1, after: 1 })
      .fetch()

    return {
      article,
      prev,
      next
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
    },
    readingTime () {
      return Math.ceil(this.$moment.duration(this.article.readingTime).asMinutes())
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
.mode-dark {
  .nuxt-content {
    @apply text-white;

    pre,
    code {
      @apply bg-gray-800 text-white;
    }
  }
}

.nuxt-content {
  @apply leading-loose;

  h2 {
    @apply text-xl font-bold my-6 table;

    &::after {
      content: " ";
      @apply w-4/5 block border-2 border-green-500 rounded;
    }

    > a {
      &::before {
        content: "#";
        @apply text-green-500 -ml-5 pr-1 absolute opacity-0;
      }
    }

    &:hover {
      > a::before {
        @apply opacity-100;
      }
    }
  }

  h3 {
    @apply text-lg font-medium my-6 table;

    &::after {
      content: " ";
      @apply w-4/5 block border-2 border-gray-500 rounded;
    }

    > a {
      &::before {
        content: "#";
        @apply text-gray-500 -ml-5 pr-1 absolute opacity-0;
      }
    }

    &:hover {
      > a::before {
        @apply opacity-100;
      }
    }
  }

  code {
    @apply bg-gray-100 p-1 text-xs text-orange-500 rounded;
  }

  pre {
    @apply bg-gray-100 p-3 rounded;

    code {
      @apply bg-transparent p-0 text-sm text-black;
      text-shadow: none;
    }
  }

  ol {
    @apply list-decimal list-inside;

    > li {
      @apply py-2;
    }
  }

  a {
    @apply text-green-500;

    &:hover {
      @apply underline;
    }
  }
}
</style>
