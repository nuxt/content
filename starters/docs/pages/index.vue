<template>
  <div>
    <div class="flex flex-wrap relative">
      <aside
        class="h-screen w-full lg:w-1/5 fixed lg:sticky top-0 left-0 bottom-0 pt-16 lg:-mt-16 lg:block bg-white dark:bg-gray-900 lg:bg-transparent z-30 lg:border-r dark:border-gray-800"
        :class="{ 'block': menu, 'hidden': !menu }"
      >
        <ul class="container mx-auto overflow-auto h-full p-4 lg:p-8">
          <li
            v-for="(docs, category) in $store.state.categories[$i18n.locale]"
            :key="category"
            class="mb-6 last:mb-0"
          >
            <h3
              class="mb-3 lg:mb-2 text-gray-500 dark:text-gray-600 uppercase tracking-wide font-bold text-sm lg:text-xs"
            >{{ category }}</h3>
            <ul>
              <li v-for="doc of docs" :key="doc.slug">
                <NuxtLink
                  :to="localePath({ name: 'index-slug', params: { slug: doc.slug !== 'index' ? doc.slug : undefined } })"
                  class="px-2 lg:-mx-2 rounded font-medium py-1 block text-gray-600 dark:text-gray-500 hover:text-gray-800 dark-hover:text-gray-100"
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

<script>
export default {
  computed: {
    menu: {
      get () {
        return this.$store.state.menu.open
      },
      set (val) {
        this.$store.commit('menu/toggle', val)
      }
    }
  }
}
</script>
