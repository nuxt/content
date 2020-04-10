<template>
  <div class="max-w-6xl mx-auto px-8">
    <div class="flex flex-wrap -mx-8">
      <nav class="w-full lg:w-1/5 p-8 border-r lg:sticky lg:top-0 lg:h-screen">
        <ul class="mb-4 last:mb-0">
          <li v-for="(docs, category) in categories" :key="category">
            <h3 class="text-sm tracking-wide uppercase font-black mb-2">{{ category }}</h3>

            <ul class="ml-2">
              <li v-for="doc of docs" :key="doc.slug">
                <nuxt-link
                  :to="`/${doc.slug !== 'index' ? doc.slug : ''}`"
                  class="font-semibold py-1 block hover:text-gray-600 transition ease-in-out duration-150"
                  exact-active-class="text-green-500 hover:text-green-500"
                >{{ doc.title }}</nuxt-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <div class="w-full lg:w-4/5 px-8">
        <nuxt-child />
      </div>
    </div>
  </div>
</template>

<script>
import { groupBy } from 'lodash'

export default {
  async asyncData ({ $content, route }) {
    const docs = await $content().sortBy('position').fetch()

    const categories = groupBy(docs, 'category')

    return {
      categories
    }
  },
  head () {
    return {
      title: 'Blog'
    }
  }
}
</script>
