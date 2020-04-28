<template>
  <div class="flex flex-wrap-reverse -mx-4 lg:-mx-8 h-full">
    <div class="w-full lg:w-3/4 p-4 lg:p-8 lg:border-l dark:border-gray-800" :class="{ 'lg:border-r': doc.toc.length }">
      <article>
        <h1 class="text-4xl font-black mb-4 leading-none">{{ doc.title }}</h1>
        <nuxt-content :document="doc" />
      </article>
      <div class="flex justify-between items-center mt-8">
        <NuxtLink
          v-if="prev"
          :to="`/${prev.slug}`"
          class="text-green-500 font-bold hover:underline flex items-center"
        >
          <icon-arrow-left />
          {{ prev.title }}
        </NuxtLink>
        <span v-else>&nbsp;</span>
        <NuxtLink
          v-if="next"
          :to="`/${next.slug}`"
          class="text-green-500 font-bold hover:underline flex items-center"
        >
          {{ next.title }}
          <icon-arrow-right />
        </NuxtLink>
        <span v-else>&nbsp;</span>
      </div>
    </div>
    <article-toc v-if="doc.toc.length" :toc="doc.toc" />
  </div>
</template>

<script>
import ArticleToc from '@/components/ArticleToc'

export default {
  components: {
    ArticleToc
  },
  scrollToTop: true,
  async asyncData ({ $content, params, error }) {
    const slug = params.slug || 'index'

    let doc
    try {
      doc = await $content(slug).fetch()
    } catch (e) {
      error({ message: 'Page not found' })
    }

    const [prev, next] = await $content()
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
        content: '#';
        @apply text-green-500 font-normal -ml-6 pr-1 absolute opacity-0;
      }
    }

    &:hover {
      > a::before {
        @apply opacity-100;
      }
    }
  }

  h3 {
    @apply text-2xl font-extrabold mb-2 pb-1 border-b -mt-16 pt-20;

    > a {
      &::before {
        content: '#';
        @apply text-green-500 font-normal -ml-5 pr-1 absolute opacity-0;
      }
    }

    &:hover {
      > a::before {
        @apply opacity-100;
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

  &-highlight {
    @apply relative;

    > .filename {
      @apply absolute right-0 text-gray-600 font-light z-10 mr-2 mt-1 text-sm;
    }
  }
}
</style>
