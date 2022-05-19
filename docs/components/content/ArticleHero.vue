<template>
  <div class="py-10 sm:py-20">
    <div class="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8 flex flex-col gap-y-8 items-center justify-center text-center">
      <div v-if="page.date" class="font-semibold text-gray-400">
        <time>{{ formatDateByLocale('en', page.date) }}</time> - {{ page.category }}
      </div>
      <h1 class="font-bold text-gray-900 dark:text-white text-5xl">
        {{ page.title }}
      </h1>
      <p class="text-gray-700 dark:text-gray-200 font-medium max-w-5xl">
        {{ page.description }}
      </p>
      <ul class="flex flex-wrap items-center justify-center gap-4">
        <li v-for="author in page.authors" :key="author.name" class="group">
          <a :href="author.link" alt="twitter account" class="flex gap-x-2 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 p-2 rounded-md transition-colors duration-300">
            <div class="rounded-full h-12 w-12">
              <img :src="author.avatarUrl" :alt="author.name" class="rounded-full border-2 border-gray-500">
            </div>
            <div class="flex flex-col items-start justify-center">
              <span class="text-gray-900 dark:text-white">{{ author.name }}</span>
              <span class="text-sm text-gray-400 ">{{ `@${author.link.split('/').pop()}` }}</span>
            </div>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  page: {
    type: Object,
    default: () => {}
  }
})

const formatDateByLocale = (locale, d) => {
  return new Date(d).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
