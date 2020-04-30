<template>
  <nav class="fixed top-0 z-10 w-full border-b dark:border-gray-800 bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 lg:px-8 flex-1">
      <div class="flex items-center justify-between h-16">
        <NuxtLink
          :to="localePath('index')"
          class="text-xl font-bold tracking-tight flex items-center flex-shrink-0"
        >
          <img class="h-8 w-auto" src="/logo.svg" alt />
        </NuxtLink>
        <div class="flex-1 flex justify-center ml-4 mr-2 lg:mx-8">
          <SearchInput @focus="focus => searchFocus = focus" />
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
            <icon-website class="w-6 h-6" />
          </a>

          <a
            href="https://twitter.com/nuxt_js"
            target="_blank"
            rel="noopener noreferrer"
            title="Twitter"
            name="Twitter"
            class="hidden lg:block hover:text-green-500 transition ease-in-out duration-150 mr-2"
          >
            <icon-twitter class="w-6 h-6" />
          </a>

          <a
            href="https://github.com/nuxt-company/content-module"
            target="_blank"
            rel="noopener noreferrer"
            title="Github"
            name="Github"
            class="hidden lg:block hover:text-green-500 mr-4 transition ease-in-out duration-150"
          >
            <icon-github class="w-6 h-6" />
          </a>

          <Dropdown :class="{ 'hidden lg:block': searchFocus }">
            <template #trigger="{ open }">
              <button
                class="p-2 rounded-md hover:text-green-500 focus:outline-none transition ease-in-out duration-150 focus:outline-none"
                :class="{ 'text-green-500': open }"
              >
                <icon-translate class="w-6 h-6" />
              </button>
            </template>

            <ul class="py-2">
              <li v-for="locale in availableLocales" :key="locale.code">
                <nuxt-link
                  v-if="$i18n.locale !== locale.code"
                  :to="switchLocalePath(locale.code)"
                  class="flex px-4 items-center hover:text-green-500 leading-7 transition ease-in-out duration-150"
                >{{ locale.name }}</nuxt-link>
              </li>
            </ul>
          </Dropdown>

          <button
            :class="{ 'hidden lg:block': searchFocus }"
            class="p-2 rounded-md hover:text-green-500 focus:outline-none transition ease-in-out duration-150 focus:outline-none"
            @click="$colorMode.value === 'dark' ? $colorMode.preference = 'light' : $colorMode.preference = 'dark'"
          >
            <icon-sun v-if="$colorMode.value === 'light'" class="w-6 h-6" />
            <icon-moon v-else class="w-6 h-6" />
          </button>

          <button
            class="lg:hidden p-2 rounded-md hover:text-green-500 focus:outline-none transition ease-in-out duration-150 focus:outline-none"
            @click="menuOpen = !menuOpen"
          >
            <icon-x v-if="menu" class="w-6 h-6" />
            <icon-menu v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <ul v-if="menuOpen" class="px-4 py-4 lg:hidden">
      <li
        v-for="(docs, category) in $store.state.categories[$i18n.locale]"
        :key="category"
        class="mb-4 last:mb-0"
      >
        <h3 class="text-sm tracking-wide uppercase font-black mb-2">{{ category }}</h3>

        <ul>
          <li v-for="doc of docs" :key="doc.slug" class="text-gray-600">
            <NuxtLink
              :to="localePath({ name: 'index-slug', params: { slug: doc.slug !== 'index' ? doc.slug : undefined } })"
              class="mt-1 block px-3 py-2 rounded-md font-medium hover:text-gray-700 dark-hover:text-white hover:bg-gray-200 dark-hover:bg-gray-700 focus:outline-none dark-focus:text-white dark-focus:bg-gray-700 transition duration-150 ease-in-out"
              exact-active-class="text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-800 dark-hover:bg-gray-800"
              @click.native="menuOpen = false"
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
      menuOpen: false,
      searchFocus: false
    }
  },
  computed: {
    availableLocales () {
      return this.$i18n.locales.filter(i => i.code !== this.$i18n.locale)
    }
  }
}
</script>
