<template>
  <div class="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8 min-h-screen">
    <div class="fixed inset-0">
      <div class="bg-white h-1/2"></div>
    </div>
    <div class="relative max-w-7xl mx-auto">
      <nav class="flex items-center justify-center text-sm leading-5 font-medium">
        <nuxt-link
          to="/"
          class="text-gray-500 hover:text-gray-700 focus:outline-none focus:underline transition duration-150 ease-in-out"
        >Home</nuxt-link>
        <svg
          class="flex-shrink-0 mx-2 h-5 w-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <nuxt-link
          to="/articles"
          class="text-gray-500 hover:text-gray-700 focus:outline-none focus:underline transition duration-150 ease-in-out"
        >Articles</nuxt-link>
      </nav>
      <div class="mt-2 text-center">
        <h2
          class="text-3xl leading-9 tracking-tight font-extrabold text-gray-900 sm:text-4xl sm:leading-10"
        >{{ article.title }}</h2>
        <p
          class="mt-3 max-w-2xl mx-auto text-xl leading-7 text-gray-500 sm:mt-4"
        >{{ article.description }}</p>
      </div>
      <div class="bg-white overflow-hidden shadow rounded-lg mt-6">
        <div class="px-4 py-5 sm:p-6">
          <md-content :body="article.body" />
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
  }
}
</script>
