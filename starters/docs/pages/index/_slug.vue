<template>
  <div class="flex flex-wrap -mx-4 lg:-mx-8">
    <div class="w-full lg:w-3/4 p-4 lg:p-8 lg:border-l lg:border-r dark:border-gray-800">
      <article>
        <h1 class="text-4xl font-black mb-4 leading-none">{{ doc.title }}</h1>

        <nuxt-content :body="doc.body" />
      </article>

      <div class="flex justify-between items-center mt-8">
        <nuxt-link
          v-if="prev"
          :to="`/${prev.slug}`"
          class="text-green-500 font-bold hover:underline flex items-center"
        >
          <svg fill="currentColor" viewBox="0 0 20 20" class="w-4 h-4 mr-1">
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
          class="text-green-500 font-bold hover:underline flex items-center"
        >
          {{ next.title }}
          <svg fill="currentColor" viewBox="0 0 20 20" class="w-4 h-4 ml-1">
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

    <div class="w-full lg:w-1/4 p-4 lg:p-8">
      <div class="lg:sticky lg:top-0 lg:pt-24 lg:-mt-24">
        <h3 class="text-sm tracking-wide uppercase font-black mb-2">On this page</h3>

        <nav>
          <scrollactive highlight-first-item active-class="text-green-500" tag="ul">
            <li
              v-for="link of doc.toc"
              :key="link.id"
              :class="{
                'border-t border-dashed dark:border-gray-800 first:border-t-0 font-semibold': link.depth === 2
              }"
            >
              <a
                :href="`#${link.id}`"
                class="block text-sm scrollactive-item transition-transform ease-in-out duration-300 transform hover:translate-x-1"
                :class="{
                  'py-2': link.depth === 2,
                  'ml-4 pb-2': link.depth === 3
                }"
              >{{ link.text }}</a>
            </li>
          </scrollactive>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
      .fields(['title', 'slug'])
      .sortBy('position')
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
    p > code {
      @apply bg-gray-800;
    }
  }
}

.nuxt-content {
  h2 {
    @apply text-2xl font-black mb-2 py-1 border-b -mt-16 pt-16;

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
  }

  h3 {
    @apply text-xl font-extrabold mb-2 py-1 border-b -mt-16 pt-16;

    > a {
      &::before {
        content: "#";
        @apply text-green-500 font-normal -ml-4 pr-1 absolute opacity-0;
      }
    }

    &:hover {
      > a::before {
        @apply opacity-100;
      }
    }
  }

  ul {
    @apply list-disc list-inside;

    > li {
      @apply pb-1;
    }
  }

  ol {
    @apply list-decimal list-inside;

    > li {
      @apply pb-1;
    }
  }

  a {
    @apply underline;
  }

  p {
    @apply mb-4;
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

  &-highlight {
    @apply relative;

    > .filename {
      @apply absolute right-0 text-gray-600 font-semibold z-10 mr-2 text-sm;
    }

    pre[class*="language-"] {
      @apply rounded mt-0 mb-4 bg-gray-800 relative;

      > code {
        @apply bg-gray-800 relative;
        text-shadow: none;
      }
    }
  }
}
</style>
