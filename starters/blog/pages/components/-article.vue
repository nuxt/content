<template>
  <article class="flex flex-col rounded shadow overflow-hidden mb-16 last:mb-0">
    <nuxt-link :to="`/${article.slug}`" class="flex-shrink-0">
      <img class="w-full object-cover" :src="`https://nuxtjs.org/${article.imgUrl}`" alt />
    </nuxt-link>

    <div class="flex-1 bg-white dark:bg-gray-700 p-8 flex flex-col justify-between">
      <div class="flex-1">
        <p class="leading-none">
          <span
            v-for="tag of article.tags"
            :key="tag"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium leading-4 bg-green-100 dark:bg-green-500 text-green-500 dark:text-white mr-2"
          >{{ tag }}</span>
        </p>
        <nuxt-link :to="`/${article.slug}`" class="block">
          <h3
            class="mt-2 text-xl leading-7 font-semibold text-gray-900 dark:text-white"
          >{{ article.title }}</h3>
          <p
            class="mt-3 text-base leading-6 text-gray-600 dark:text-gray-400"
          >{{ article.description }}</p>
        </nuxt-link>
      </div>
      <div class="mt-6 flex items-center">
        <div class="flex-shrink-0">
          <a :href="article.authors[0].link">
            <img class="h-10 w-10 rounded-full" :src="article.authors[0].avatarUrl" alt />
          </a>
        </div>
        <div class="ml-3">
          <p class="text-sm leading-5 font-medium text-gray-900 dark:text-white">
            <a :href="article.authors[0].link" class="hover:underline">{{ article.authors[0].name }}</a>
          </p>
          <div class="flex text-sm leading-5 text-gray-500">
            <time datetime="2020-03-16">{{ $moment(article.date).format('LL') }}</time>
            <span class="mx-1">&middot;</span>
            <span>{{ readingTime }} min read</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  props: {
    article: {
      type: Object,
      required: true
    }
  },
  computed: {
    readingTime () {
      return Math.ceil(this.$moment.duration(this.article.readingTime).asMinutes())
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
