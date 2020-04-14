<template>
  <header
    class="h-16 fixed top-0 z-10 w-full border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex"
  >
    <div class="container mx-auto px-4 lg:px-8 flex-1 flex items-center justify-between">
      <nuxt-link to="/" class="text-xl font-bold tracking-tight">Nuxt Content</nuxt-link>

      <div class="flex-1 flex justify-center mx-4 lg:mx-16">
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
                v-model="q"
                class="block w-full pl-10 pr-3 py-2 leading-5 border-2 border-transparent focus:border-gray-300 dark-focus:border-gray-700 rounded-md focus:outline-none focus:bg-white dark-focus:bg-gray-900 bg-gray-200 dark:bg-gray-700 transition duration-150 ease-in-out"
                :class="{ 'rounded-b-none': focus && results.length }"
                placeholder="Search"
                type="search"
                autocomplete="off"
                @focus="focus = true"
                @blur="close"
              />
            </div>
          </div>

          <ul
            v-show="focus && results.length"
            class="z-10 absolute w-full flex-1 top-0 bg-white dark:bg-gray-900 rounded-md border-2 border-gray-300 dark:border-gray-700"
            :class="{ 'rounded-t-none': focus && results.length }"
            style="margin-top: 38px;"
          >
            <li v-for="result of results" :key="result.slug" class="px-4 py-2">
              <nuxt-link
                :to="`/${result.slug !== 'index' ? result.slug : ''}`"
                class="flex items-center leading-5 hover:text-green-500 transition ease-in-out duration-150"
                @click="close"
              >
                <span class="font-bold hidden lg:block">{{ result.category }}</span>
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  class="w-3 h-3 mx-1 hidden lg:block"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
                {{ result.title }}
              </nuxt-link>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex items-center">
        <a
          href="https://nuxtjs.org"
          target="_blank"
          rel="noopener noreferrer"
          title="Website"
          name="Website"
          class="hover:text-green-500 transition ease-in-out duration-150 mr-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-6 h-6"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            />
          </svg>
        </a>

        <a
          href="https://twitter.com/nuxt_js"
          target="_blank"
          rel="noopener noreferrer"
          title="Twitter"
          name="Twitter"
          class="hover:text-green-500 transition ease-in-out duration-150 mr-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-6 h-6"
          >
            <path
              d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
            />
          </svg>
        </a>

        <a
          href="https://github.com/nuxt-company/content-module"
          target="_blank"
          rel="noopener noreferrer"
          title="Github"
          name="Github"
          class="hover:text-green-500 transition ease-in-out duration-150 mr-4"
        >
          <svg
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
            class="w-6 h-6"
          >
            <path
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
            />
          </svg>
        </a>

        <button
          class="hover:text-green-500 transition ease-in-out duration-150 focus:outline-none"
          @click="theme === 'dark' ? theme = 'light' : theme = 'dark'"
        >
          <svg
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            class="w-6 h-6"
          >
            <path
              v-if="theme === 'dark'"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
            <path
              v-else
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  data () {
    return {
      q: '',
      focus: false,
      results: []
    }
  },
  computed: {
    theme: {
      get () {
        return this.$store.state.theme
      },
      set (theme) {
        this.$store.commit('setTheme', theme)
      }
    }
  },
  watch: {
    async q (q) {
      this.results = await this.$content().sortBy('position').limit(12).search(q).fetch()
    }
  },
  methods: {
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
