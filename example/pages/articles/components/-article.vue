<template>
  <div class="flex flex-col rounded-lg shadow-lg overflow-hidden">
    <div class="flex-shrink-0">
      <img class="h-48 w-full object-cover" :src="`https://nuxtjs.org/${article.imgUrl}`" alt />
    </div>
    <div class="flex-1 bg-white p-6 flex flex-col justify-between">
      <div class="flex-1">
        <p class="text-sm leading-5 font-medium text-indigo-600">
          <a v-for="tag of article.tags" :key="tag" href="#" class="hover:underline mr-2">{{ tag }}</a>
        </p>
        <nuxt-link :to="{ name: 'articles-slug', params: { slug: article.slug } }" class="block">
          <h3 class="mt-2 text-xl leading-7 font-semibold text-gray-900">{{ article.title }}</h3>
          <p class="mt-3 text-base leading-6 text-gray-500">{{ article.description }}</p>
        </nuxt-link>
      </div>
      <div class="mt-6 flex items-center">
        <div class="flex-shrink-0">
          <a :href="article.authors[0].link">
            <img class="h-10 w-10 rounded-full" :src="article.authors[0].avatarUrl" alt />
          </a>
        </div>
        <div class="ml-3">
          <p class="text-sm leading-5 font-medium text-gray-900">
            <a :href="article.authors[0].link" class="hover:underline">{{ article.authors[0].name }}</a>
          </p>
          <div class="flex text-sm leading-5 text-gray-500">
            <time datetime="2020-03-16">{{ $moment(article.date).format('LL') }}</time>
            <span class="mx-1">&middot;</span>
            <span>6 min read</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    article: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
