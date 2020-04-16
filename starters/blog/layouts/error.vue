<template>
  <div>
    <header class="px-8 flex items-center justify-between sticky top-0 h-20">
      <nuxt-link
        to="/"
        class="text-gray-800 hover:text-gray-600 dark:text-white dark-hover:text-gray-400 focus:outline-none focus:underline flex items-center transition duration-150 ease-in-out"
      >
        <svg class="flex-shrink-0 mr-1 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg> Nuxt.js Blog Starter
      </nuxt-link>

      <div class="ml-8">
        <button
          class="text-gray-800 hover:text-gray-600 dark:text-white dark-hover:text-gray-400 focus:outline-none"
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
      </div>
    </header>

    <div class="max-w-4xl mx-auto text-center py-16 px-4">
      <h2 class="text-3xl font-extrabold dark:text-white">{{ error.message }}</h2>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      required: true
    }
  },
  head () {
    return {
      title: this.error.message
    }
  }
}
</script>
