<template>
  <div class="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8 min-h-screen">
    <div class="relative max-w-7xl mx-auto">
      <nav class="flex items-center justify-center text-sm leading-5 font-medium">
        <nuxt-link
          :to="{ name: 'articles' }"
          class="text-gray-500 hover:text-gray-700 focus:outline-none focus:underline transition duration-150 ease-in-out"
        >Articles</nuxt-link>
      </nav>
      <div class="mt-2 text-center">
        <h2
          class="text-3xl leading-9 tracking-tight font-extrabold text-gray-900 sm:text-4xl sm:leading-10"
          v-html="page.title"
        />
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg mt-6">
        <div class="px-4 py-5 sm:p-6">
          <nuxt-content :body="page.body" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('home').fields(['title', 'body']).fetch()

    return {
      page
    }
  }
}
</script>
