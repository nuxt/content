<template>
  <nav
    class="fixed top-0 z-40 w-full border-b dark:border-gray-800 bg-white dark:bg-gray-900"
    @click="scrollToTop"
  >
    <div class="container mx-auto px-4 lg:px-8 flex-1">
      <div class="flex items-center justify-between h-16">
        <div class="w-1/2 lg:w-1/6 flex items-center" @click.stop="noop">
          <NuxtLink
            :to="localePath('slug')"
            class="flex-shrink-0 font-bold text-xl mr-1"
            :aria-label="`${settings.title} Logo`"
          >
            <span v-if="!logo">{{ settings.title }}</span>

            <img v-if="logo" :src="logo.light" class="h-8 w-auto light-img" :alt="settings.title" />
            <img v-if="logo" :src="logo.dark" class="h-8 w-auto dark-img" :alt="settings.title" />
          </NuxtLink>
          <NuxtLink
            v-if="lastRelease"
            to="/releases"
            class="rounded text-green-500 dark:text-white bg-green-100 dark:bg-green-700 border border-green-200 dark:border-transparent p-1 text-xs font-bold leading-none flex items-center justify-center ml-1"
          >{{ lastRelease.name }}</NuxtLink>
        </div>
        <div class="hidden flex-1 lg:flex justify-center ml-4 mr-2 lg:mx-8 w-4/6">
          <AppSearch />
        </div>
        <div class="flex items-center justify-end w-1/6">
          <a
            :href="`https://twitter.com/${settings.twitter}` || 'https://twitter.com/nuxt_js'"
            target="_blank"
            rel="noopener noreferrer"
            title="Twitter"
            name="Twitter"
            class="hidden lg:block hover:text-green-500 mr-2"
          >
            <IconTwitter class="w-6 h-6" />
          </a>
          <a
            :href="`https://github.com/${settings.repo}` || 'https://github.com/nuxt/content'"
            target="_blank"
            rel="noopener noreferrer"
            title="Github"
            name="Github"
            class="hidden lg:block hover:text-green-500 mr-4"
          >
            <IconGithub class="w-6 h-6" />
          </a>
          <button
            class="lg:hidden p-2 rounded-md hover:text-green-500 focus:outline-none focus:outline-none -mr-2"
            aria-label="Hamburger Menu"
            @click.stop="menu = !menu"
          >
            <IconX v-if="menu" class="w-6 h-6" />
            <IconMenu v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'settings',
      'lastRelease'
    ]),
    menu: {
      get () {
        return this.$store.state.menu.open
      },
      set (val) {
        this.$store.commit('menu/toggle', val)
      }
    },
    logo () {
      if (!this.settings.logo) {
        return
      }

      if (typeof this.settings.logo === 'object') {
        return this.settings.logo
      }

      return {
        light: this.settings.logo,
        dark: this.settings.logo
      }
    }
  },
  methods: {
    scrollToTop () {
      if (window.innerWidth >= 1280) {
        return
      }
      window.scrollTo(0, 0)
    },
    noop () { }
  }
}
</script>
