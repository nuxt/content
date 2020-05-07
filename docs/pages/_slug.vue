<template>
  <div class="flex flex-wrap-reverse -mx-4 lg:-mx-8">
    <div
      class="w-full lg:w-3/4 p-4 lg:p-8 dark:border-gray-800"
      :class="{ 'lg:border-r': doc.toc && doc.toc.length }"
    >
      <article>
        <h1 class="text-4xl font-black mb-4 leading-none">{{ doc.title }}</h1>
        <nuxt-content :document="doc" />
      </article>
      <div class="pt-4 flex">
        <a :href="githubLink" target="_blank" class="text-gray-600 dark:text-gray-400 text-sm font-medium hover:underline flex items-center">
          {{ $t('article.github') }}
          <icon-external-link class="w-4 h-4 ml-1" />
        </a>
      </div>
      <article-prev-next :prev="prev" :next="next" />
    </div>
    <article-toc v-if="doc.toc && doc.toc.length" :toc="doc.toc" />
  </div>
</template>

<script>
import ArticleToc from '@/components/ArticleToc'
import ArticlePrevNext from '@/components/ArticlePrevNext'

export default {
  components: {
    ArticleToc,
    ArticlePrevNext
  },
  scrollToTop: true,
  middleware ({ params, redirect }) {
    if (params.slug === 'index') {
      redirect('/')
    }
  },
  async asyncData ({ $content, app, params, error }) {
    const slug = params.slug || 'index'

    let doc
    try {
      doc = await $content(app.i18n.locale, slug).fetch()
    } catch (e) {
      error({ statusCode: 404, message: 'Page not found' })
    }

    const [prev, next] = await $content(app.i18n.locale)
      .only(['title', 'slug'])
      .sortBy('position', 'asc')
      .surround(slug, { before: 1, after: 1 })
      .fetch()

    return {
      doc,
      prev,
      next
    }
  },
  computed: {
    githubLink () {
      return `https://github.com/nuxt/content/edit/master/starters/docs/content${this.doc.path}${this.doc.extension}`
    }
  },
  head () {
    return {
      title: this.doc.title
    }
  }
}
</script>

<style lang="scss">
.dark-mode {
  .nuxt-content {
    h2,
    h3,
    blockquote {
      @apply border-gray-800;
    }

    > code,
    li > code,
    p > code,
    h3 > code {
      @apply bg-gray-800;
    }
  }
}

.nuxt-content {
  h2 {
    @apply text-3xl font-black mb-4 pb-1 border-b -mt-16 pt-24;

    > a {
      &::before {
        content: "#";
        @apply text-green-500 font-normal -ml-6 pr-1 absolute opacity-0;
      }
    }

    &:hover {
      > a::before {
        @apply opacity-100;
      }
    }

    @media (max-width: 640px) {
      @apply ml-6;

      > a {
        &::before {
          @apply opacity-100;
        }
      }
    }
  }

  h3 {
    @apply text-2xl font-extrabold mb-2 pb-1 border-b -mt-16 pt-20;

    > a {
      &::before {
        content: "#";
        @apply text-green-500 font-normal -ml-5 pr-1 absolute opacity-0;
      }
    }

    &:hover {
      > a::before {
        @apply opacity-100;
      }
    }

    @media (max-width: 640px) {
      @apply ml-6;

      > a {
        &::before {
          @apply opacity-100;
        }
      }
    }
  }

  ul {
    @apply list-disc list-inside mb-4;

    > li {
      @apply leading-7;

      > ul {
        @apply pl-4;
      }
    }
  }

  ol {
    @apply list-decimal list-inside mb-4;

    > li {
      @apply leading-7;

      > ol {
        @apply pl-4;
      }
    }
  }

  a {
    @apply underline;
  }

  p {
    @apply mb-4 leading-7;
  }

  blockquote {
    @apply py-2 pl-4 mb-4 border-l-4;

    > p:last-child {
      @apply mb-0;
    }
  }

  > code,
  li > code,
  p > code {
    @apply bg-gray-100 p-1 text-sm shadow-xs rounded;
  }

  h3 > code {
    @apply bg-gray-100 p-1 text-lg shadow-xs rounded;
  }

  pre[class*="language-"] {
    @apply rounded mt-0 mb-4 bg-gray-800 text-sm relative;

    > code {
      @apply bg-gray-800 relative;
      text-shadow: none;
    }
  }

  video {
    @apply w-full border rounded shadow-md;
  }

  &-highlight {
    @apply relative;

    > .filename {
      @apply absolute right-0 text-gray-600 font-light z-10 mr-2 mt-1 text-sm;
    }
  }
}
</style>
