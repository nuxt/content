<template>
  <nav
    class="lg:fixed lg:top-0 z-10 w-full border-b dark:border-gray-800 bg-white dark:bg-gray-900"
  >
    <div class="container mx-auto px-4 lg:px-8 flex-1">
      <div class="flex items-center justify-between h-16">
        <NuxtLink to="/" class="text-xl font-bold tracking-tight">Nuxt Content</NuxtLink>
        <div class="flex-1 flex justify-center mx-4 lg:mx-16">
          <SearchInput />
        </div>
        <div class="flex items-center">
          <a
            href="https://nuxtjs.org"
            target="_blank"
            rel="noopener noreferrer"
            title="Website"
            name="Website"
            class="hidden lg:block hover:text-green-500 transition ease-in-out duration-150 mr-2"
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
            class="hidden lg:block hover:text-green-500 transition ease-in-out duration-150 mr-2"
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
            class="hidden lg:block hover:text-green-500 mr-4 transition ease-in-out duration-150"
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
            class="p-2 rounded-md hover:text-green-500 focus:outline-none transition ease-in-out duration-150 focus:outline-none"
            @click="$colorMode.value === 'dark' ? $colorMode.preference = 'light' : $colorMode.preference = 'dark'"
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
                v-if="$colorMode.value === 'dark'"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
              <path
                v-else
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          <button
            class="lg:hidden p-2 rounded-md hover:text-green-500 focus:outline-none transition ease-in-out duration-150 focus:outline-none"
            @click="open = !open"
          >
            <svg v-if="open" class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <svg v-else class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <ul v-if="open" class="px-4 py-4 lg:hidden">
      <li
        v-for="(docs, category) in $store.state.categories"
        :key="category"
        class="mb-4 last:mb-0"
      >
        <h3 class="text-sm tracking-wide uppercase font-black mb-2">{{ category }}</h3>

        <ul>
          <li v-for="doc of docs" :key="doc.slug" class="text-gray-600">
            <NuxtLink
              :to="`/${doc.slug !== 'index' ? doc.slug : ''}`"
              class="mt-1 block px-3 py-2 rounded-md font-medium hover:text-gray-700 dark-hover:text-white hover:bg-gray-200 dark-hover:bg-gray-700 focus:outline-none dark-focus:text-white dark-focus:bg-gray-700 transition duration-150 ease-in-out"
              exact-active-class="text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-800 dark-hover:bg-gray-800"
              @click.native="open = false"
            >{{ doc.title }}</NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script>
import SearchInput from '@/components/SearchInput'

export default {
  components: {
    SearchInput
  },
  data () {
    return {
      open: false
    }
  }
}
</script>
