<template>
  <nav class="fixed top-0 z-40 w-full border-b dark:border-gray-800 bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 lg:px-8 flex-1">
      <div class="flex items-center justify-between h-16">
        <div class="w-1/6">
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
        </div>
        <div class="hidden flex-1 lg:flex justify-center ml-4 mr-2 lg:mx-8 w-4/6">
          <SearchInput />
        </div>
        <div class="flex items-center justify-end w-1/6">

          <a
            href="https://twitter.com/nuxt_js"
            target="_blank"
            rel="noopener noreferrer"
            title="Twitter"
            name="Twitter"
            class="hidden lg:block hover:text-green-500 mr-2"
          >
            <icon-twitter class="w-6 h-6" />
          </a>

          <a
            href="https://github.com/nuxt-company/content-module"
            target="_blank"
            rel="noopener noreferrer"
            title="Github"
            name="Github"
            class="hidden lg:block hover:text-green-500 mr-4"
          >
            <icon-github class="w-6 h-6" />
          </a>

          <button
            class="lg:hidden p-2 rounded-md hover:text-green-500 focus:outline-none focus:outline-none"
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
