<template>
  <nav class="fixed top-0 z-40 w-full border-b dark:border-gray-800 bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 lg:px-8 flex-1">
      <div class="flex items-center justify-between h-16">
        <NuxtLink
          :to="localePath('index')"
          class="text-xl font-bold tracking-tight flex items-center flex-shrink-0"
          style="width: 104px;"
        >
          <ClientOnly>
            <img slot="placeholder" class="h-8 w-auto" src="/logo.svg" alt="Nuxt Content" />
            <img v-if="$colorMode.value === 'light'" class="h-8 w-auto" src="/logo.svg" alt="Nuxt Content" />
            <img v-else class="h-8 w-auto" src="/logo-dark.svg" alt="Nuxt Content" />
          </ClientOnly>
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
            class="w-10 p-2 rounded-md hover:text-green-500 focus:outline-none transition ease-in-out duration-150 focus:outline-none"
            @click="$colorMode.value === 'dark' ? $colorMode.preference = 'light' : $colorMode.preference = 'dark'"
          >
            <ClientOnly>
              <icon-sun slot="placeholder" class="w-6 h-6" />
              <icon-sun v-if="$colorMode.value === 'light'" class="w-6 h-6" />
              <icon-moon v-else class="w-6 h-6" />
            </ClientOnly>
          </button>

          <button
            class="lg:hidden p-2 rounded-md hover:text-green-500 focus:outline-none transition ease-in-out duration-150 focus:outline-none"
            @click="menu = !menu"
          >
            <icon-x v-if="menu" class="w-6 h-6" />
            <icon-menu v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
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
      searchFocus: false
    }
  },
  computed: {
    menu: {
      get () {
        return this.$store.state.menu.open
      },
      set (val) {
        this.$store.commit('menu/toggle', val)
      }
    },
    availableLocales () {
      return this.$i18n.locales.filter(i => i.code !== this.$i18n.locale)
    }
  }
}
</script>
