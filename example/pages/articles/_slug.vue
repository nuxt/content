<template>
  <div>
    <div class="mb-8">
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
      <div class="mt-2 text-center max-w-5xl mx-auto">
        <h2
          class="text-3xl leading-9 tracking-tight font-extrabold text-gray-900 sm:text-4xl sm:leading-10"
        >{{ article.title }}</h2>
        <p
          class="mt-3 mx-auto text-xl font-light leading-7 text-gray-500 sm:mt-4"
        >{{ article.description }}</p>
      </div>
    </div>

    <div class="flex flex-wrap flex-col-reverse lg:flex-row -mx-4">
      <div class="w-full lg:w-2/3 px-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center flex-shrink-0">
            <a :href="article.authors[0].link" class="hover:underline flex items-center">
              <img class="h-6 w-6 mr-3 rounded-full" :src="article.authors[0].avatarUrl" alt />
              {{ article.authors[0].name }}
            </a>
          </div>
          <div class="flex text-sm leading-5 text-gray-500">
            <time datetime="2020-03-16">{{ $moment(article.date).format('LL') }}</time>
            <span class="mx-1">&middot;</span>
            <span>{{ readingTime }} min read</span>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg mt-2">
          <img class="h-64 w-full object-cover" :src="`https://nuxtjs.org/${article.imgUrl}`" alt />
          <div class="px-4 py-5 sm:p-6">
            <n-content :body="article.body" />
          </div>
        </div>
        <div class="flex justify-between items-center mt-4">
          <nuxt-link
            v-if="prev"
            :to="{ name: 'articles-slug', params: { slug: prev.slug } }"
            class="text-green-500 font-bold hover:underline flex items-center"
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
            :to="{ name: 'articles-slug', params: { slug: next.slug } }"
            class="text-green-500 font-bold hover:underline flex items-center"
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
      </div>
      <div class="w-full lg:w-1/3 px-4">
        <div class="lg:sticky lg:top-0 lg:pt-8">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <p class="font-bold uppercase mb-2">On this page</p>

              <div class="-ml-8">
                <scrollactive highlight-first-item active-class="text-green-500">
                  <a
                    v-for="link of article.toc"
                    :key="link.id"
                    :href="`#${link.id}`"
                    class="block mb-1 last:mb-0 text-sm scrollactive-item"
                    :class="`ml-${link.depth * 4}`"
                  >{{ link.text }}</a>
                </scrollactive>
              </div>
            </div>
          </div>
        </div>
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
        @apply text-green-500 -ml-4 pr-1 absolute opacity-0;
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
        @apply text-gray-500 -ml-4 pr-1 absolute opacity-0;
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
