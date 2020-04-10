<template>
  <div class="flex flex-wrap -mx-8">
    <div class="w-full lg:w-3/4 px-8 lg:px-12 lg:py-8">
      <h1 class="text-4xl font-black mb-4 leading-none">{{ doc.title }}</h1>

      <nuxt-content :body="doc.body" />

      <div class="flex justify-between items-center mt-8">
        <nuxt-link
          v-if="prev"
          :to="`/${prev.slug}`"
          class="text-green-500 font-bold hover:underline flex items-center transition ease-in-out duration-150"
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
          class="text-green-500 font-bold hover:underline flex items-center transition ease-in-out duration-150"
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

    <div class="w-full lg:w-1/4 p-8 border-l lg:sticky lg:top-0 lg:h-screen">
      <h3 class="text-sm tracking-wide uppercase font-black mb-2">On this page</h3>

      <scrollactive highlight-first-item active-class="text-green-500" tag="ul">
        <li
          v-for="link of doc.toc"
          :key="link.id"
          :class="{
            'border-t border-dashed first:border-t-0 font-semibold': link.depth === 2
          }"
        >
          <a
            :href="`#${link.id}`"
            class="block text-sm scrollactive-item transition ease-in-out duration-150 transform hover:translate-x-1"
            :class="{
              'py-2': link.depth === 2,
              'ml-4 pb-2': link.depth === 3
            }"
          >{{ link.text }}</a>
        </li>
      </scrollactive>
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
// .mode-dark {
//   .nuxt-content {
//     @apply text-white;

//     pre,
//     code {
//       @apply bg-gray-800 text-white;
//     }
//   }
// }

.nuxt-content {
  h2 {
    @apply text-2xl font-black mb-2 mt-6 py-1 border-b;

    > a {
      &::before {
        content: "#";
        @apply text-green-500 font-normal -ml-6 pr-2 absolute opacity-0;
      }
    }

    &:hover {
      > a::before {
        @apply opacity-100;
      }
    }
  }

  h3 {
    @apply text-xl font-extrabold mb-2 mt-6 py-1 border-b;

    > a {
      &::before {
        content: "#";
        @apply text-green-500 font-normal -ml-5 pr-2 absolute opacity-0;
      }
    }

    &:hover {
      > a::before {
        @apply opacity-100;
      }
    }
  }

  > code,
  p > code {
    @apply bg-gray-100 p-1 text-sm border rounded;
  }

  pre {
    @apply rounded mt-0 mb-4;

    code {
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

  p {
    @apply mb-4;
  }

  blockquote {
    @apply py-2 pl-4 mb-4 border-l-4 border-gray-200;

    > p:last-child {
      @apply mb-0;
    }
  }
}
</style>
