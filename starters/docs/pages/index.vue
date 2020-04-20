<template>
  <div class="flex flex-wrap -mx-4 lg:-mx-8 relative" style="height: calc(100vh - 4rem)">
    <aside class="w-full lg:w-1/5 p-4 lg:p-8">
      <ul class="lg:sticky lg:top-0 lg:pt-24 lg:-mt-24">
        <li v-for="(docs, category) in categories" :key="category" class="mb-4 last:mb-0">
          <h3 class="text-sm tracking-wide uppercase font-black mb-2">{{ category }}</h3>

          <ul class="pl-2">
            <li v-for="doc of docs" :key="doc.slug">
              <nuxt-link
                :to="`/${doc.slug !== 'index' ? doc.slug : ''}`"
                class="font-medium py-1 block"
                exact-active-class="text-green-500"
              >{{ doc.title }}</nuxt-link>
            </li>
          </ul>
        </li>
      </ul>
    </aside>

    <div class="w-full lg:w-4/5 px-4 lg:px-8">
      <nuxt-child />
    </div>
  </div>
</template>

<script>
import groupBy from 'lodash.groupby'

export default {
  async asyncData ({ $content, route }) {
    const docs = await $content().sortBy('position', 'asc').fetch()

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
