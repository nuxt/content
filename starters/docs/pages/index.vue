<template>
  <div>
    <div class="flex flex-wrap -mx-4 lg:-mx-8 relative" style="height: calc(100vh - 4rem)">
      <aside class="w-full lg:w-1/5 p-4 lg:p-8 hidden md:block">
        <ul class="md:sticky md:top-0 md:pt-24 md:-mt-24">
          <li
            v-for="(docs, category) in $store.state.categories"
            :key="category"
            class="mb-6 last:mb-0"
          >
            <h3 class="mb-3 lg:mb-2 text-gray-500 uppercase tracking-wide font-bold text-sm lg:text-xs">{{ category }}</h3>
            <ul>
              <li v-for="doc of docs" :key="doc.slug">
                <NuxtLink
                  :to="`/${doc.slug !== 'index' ? doc.slug : ''}`"
                  class="px-2 -mx-2 rounded font-medium py-1 block text-gray-600 dark:text-gray-500 hover:text-gray-800 dark-hover:text-gray-100"
                  exact-active-class="text-green-600 bg-green-100 hover:text-green-600 dark:text-green-200 dark:bg-green-900 dark-hover:text-green-200"
                >{{ doc.title }}</NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </aside>
      <div class="w-full lg:w-4/5 px-4 lg:px-8">
        <NuxtChild />
      </div>
    </div>
  </div>
</template>
