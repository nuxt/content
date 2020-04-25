<template>
  <div class="w-full relative flex flex-col justify-between">
    <div class="w-full relative">
      <label for="search" class="sr-only">Search</label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            class="h-5 w-5 text-gray-500"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="search"
          ref="search"
          v-model="q"
          class="block w-full pl-10 pr-3 py-2 truncate leading-5 placeholder-gray-500 border border-transparent text-gray-700 dark-focus:text-white focus:border-gray-300 dark-focus:border-gray-700 rounded-md focus:outline-none focus:bg-white dark-focus:bg-gray-900 bg-gray-200 dark:bg-gray-800"
          :class="{ 'rounded-b-none': focus && results.length }"
          :placeholder="searchPlaceholder"
          type="search"
          autocomplete="off"
          @focus="focus = true"
          @blur="close"
        />
      </div>
    </div>
    <ul
      v-show="focus && (searching || results.length)"
      class="z-10 absolute w-full flex-1 top-0 bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700"
      :class="{ 'rounded-t-none': focus && results.length }"
      style="margin-top: 37px;"
    >
      <li v-if="searching && !results.length" class="px-4 py-2">Searching...</li>
      <li v-for="result of results" :key="result.slug" class="px-4 py-2">
        <NuxtLink
          :to="`/${result.slug !== 'index' ? result.slug : ''}`"
          class="flex items-center leading-5 hover:text-green-500 transition ease-in-out duration-150"
          @click="close"
        >
          <span class="font-bold hidden sm:block">{{ result.category }}</span>
          <svg
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            class="w-3 h-3 mx-1 hidden sm:block"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
          {{ result.title }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
      q: '',
      focus: false,
      open: false,
      searchPlaceholder: 'Search the docs (Press "/" to focus)',
      searching: false,
      results: []
    }
  },
  watch: {
    async q (q) {
      if (!q) {
        this.searching = false
        this.results = []
        return
      }
      this.searching = true
      this.results = await this.$content().sortBy('position', 'asc').limit(12).search(q).fetch()
      this.searching = false
    }
  },
  mounted () {
    window.addEventListener('keyup', this.keyup)
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.keyup)
  },
  methods: {
    keyup (e) {
      if (e.key === '/') {
        this.$refs.search.focus()
      }
    },
    close () {
      setTimeout(() => {
        this.focus = false
      }, 200)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
