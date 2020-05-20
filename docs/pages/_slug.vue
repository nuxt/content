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
        <a :href="githubLink" target="_blank" rel="noopener" class="text-gray-600 dark:text-gray-400 text-sm font-medium hover:underline flex items-center">
          {{ $t('article.github') }}
          <icon-external-link class="w-4 h-4 ml-1" />
        </a>
      </div>
      <ArticlePrevNext :prev="prev" :next="next" />
    </div>
    <ArticleToc v-if="doc.toc && doc.toc.length" :toc="doc.toc" />
  </div>
</template>

<script>
export default {
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
      return error({ statusCode: 404, message: 'Page not found' })
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
      return `https://github.com/nuxt/content/edit/master/docs/content${this.doc.path}${this.doc.extension}`
    }
  },
  head () {
    return {
      title: this.doc.title,
      meta: [
        { hid: 'description', name: 'description', content: this.doc.description },
        // Open Graph
        { hid: 'og:title', property: 'og:title', content: this.doc.title },
        { hid: 'og:description', property: 'og:description', content: this.doc.description },
        // Twitter Card
        { hid: 'twitter:title', name: 'twitter:title', content: this.doc.title },
        { hid: 'twitter:description', name: 'twitter:description', content: this.doc.description }
      ]
    }
  }
}
</script>

<style lang="postcss">
.dark-mode .nuxt-content {
  & h2,
  & h3,
  & blockquote {
    @apply border-gray-800;
  }

  & > code,
  & li > code,
  & p > code,
  & h3 > code {
    @apply bg-gray-800;
  }
}

.nuxt-content h2 {
  @apply text-3xl font-black mb-4 pb-1 border-b -mt-16 pt-24;

  & > a {
    @apply ml-6;
    &::before {
      content: '#';
      @apply text-green-500 font-normal -ml-6 pr-1 absolute opacity-100;
    }
  }

  &:hover {
    & > a::before {
      @apply opacity-100;
    }
  }
}
.nuxt-content h3 {
  @apply text-2xl font-extrabold mb-2 pb-1 border-b -mt-16 pt-20;

  & > a {
    @apply ml-6;
    &::before {
      content: "#";
      @apply text-green-500 font-normal -ml-5 pr-1 absolute opacity-100;
    }
  }

  &:hover {
    & > a::before {
      @apply opacity-100;
    }
  }
}

@screen lg {
  .nuxt-content h2 a,
  .nuxt-content h3 a {
    @apply ml-0;
    &::before {
      @apply opacity-0;
    }
  }
}

.nuxt-content ul,
.nuxt-content ol {
  @apply list-disc list-inside mb-4;

  & > li {
    @apply leading-7;

    & > ul {
      @apply pl-4;
    }
  }
}

.nuxt-content ol {
  @apply list-decimal;
}

.nuxt-content {
  & a {
    @apply underline;
  }

  & p {
    @apply mb-4 leading-7;
  }

  & blockquote {
    @apply py-2 pl-4 mb-4 border-l-4;

    > p:last-child {
      @apply mb-0;
    }
  }

  & > code,
  & li > code,
  & p > code {
    @apply bg-gray-100 p-1 text-sm shadow-xs rounded;
  }

  & h3 > code {
    @apply bg-gray-100 p-1 text-lg shadow-xs rounded;
  }

  & pre[class*="language-"] {
    @apply rounded mt-0 mb-4 bg-gray-800 text-sm relative;

    > code {
      @apply bg-gray-800 relative;
      text-shadow: none;
    }
  }

  & video {
    @apply w-full border rounded shadow-md;
  }
}

.nuxt-content-highlight {
  @apply relative;

  & > .filename {
    @apply absolute right-0 text-gray-600 font-light z-10 mr-2 mt-1 text-sm;
  }
}
</style>
