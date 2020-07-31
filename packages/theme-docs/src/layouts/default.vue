<template>
  <div class="pt-16">
    <AppHeader />
    <main class="container mx-auto px-4 lg:px-8">
      <div class="flex flex-wrap relative">
        <aside
          class="w-full lg:w-1/5 lg:block fixed lg:relative inset-0 mt-16 lg:mt-0 z-30 bg-white dark:bg-gray-900 lg:bg-transparent"
          :class="{ 'block': menu, 'hidden': !menu }"
        >
          <div class="lg:sticky lg:top-0 lg:pt-16 lg:-mt-16 overflow-y-scroll h-full lg:h-auto">
            <ul class="p-4 lg:py-8 lg:pl-0 lg:pr-8">
              <li class="mb-4 lg:hidden">
                <AppSearch />
              </li>
              <li v-for="(docs, category) in categories" :key="category" class="mb-4">
                <h3
                  class="mb-2 text-gray-500 dark:text-gray-600 uppercase tracking-wide font-bold text-sm lg:text-xs"
                >{{ category }}</h3>
                <ul>
                  <li v-for="doc of docs" :key="doc.slug" class="text-gray-600 dark:text-gray-500">
                    <NuxtLink
                      :to="toLink(doc.slug)"
                      class="px-2 rounded font-medium py-1 block hover:text-gray-700 dark-hover:text-gray-100 flex items-center justify-between"
                      exact-active-class="text-green-500 bg-green-100 hover:text-green-500 dark:text-white dark:bg-green-700 dark-hover:text-white"
                    >
                      {{ doc.title }}
                      <client-only>
                        <span
                          v-if="isNew(doc)"
                          class="animate-pulse rounded-full bg-green-500 dark:bg-white opacity-75 h-2 w-2"
                        />
                      </client-only>
                    </NuxtLink>
                  </li>
                </ul>
              </li>
              <li class="mb-4 lg:hidden">
                <h3
                  class="mb-2 text-gray-500 dark:text-gray-600 uppercase tracking-wide font-bold text-sm lg:text-xs"
                >More</h3>
                <ul class="flex items-center ml-2">
                  <li class="flex items-center mr-4">
                    <a
                      href="https://twitter.com/nuxt_js"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Twitter"
                      name="Twitter"
                      class="inline-flex hover:text-green-500"
                    >
                      <IconTwitter class="w-6 h-6" />
                    </a>
                  </li>
                  <li class="flex items-center mr-4">
                    <a
                      href="https://github.com/nuxt/content"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Github"
                      name="Github"
                      class="inline-flex hover:text-green-500"
                    >
                      <IconGithub class="w-6 h-6" />
                    </a>
                  </li>
                  <li class="flex items-center mr-4">
                    <AppLangSwitcher />
                  </li>
                  <li class="flex items-center">
                    <AppColorSwitcher />
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </aside>

        <Nuxt class="w-full lg:w-4/5" />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'settings'
    ]),
    bodyClass () {
      return this.$store.state.menu.open ? ['h-screen lg:h-auto overflow-y-hidden lg:overflow-y-auto'] : []
    },
    menu: {
      get () {
        return this.$store.state.menu.open
      },
      set (val) {
        this.$store.commit('menu/toggle', val)
      }
    },
    categories () {
      return this.$store.state.categories[this.$i18n.locale]
    }
  },
  methods: {
    isNew (document) {
      if (process.server) {
        return
      }
      if (!document.version || document.version <= 0) {
        return
      }

      const version = localStorage.getItem(`document-${document.slug}-version`)
      if (document.version > Number(version)) {
        return true
      }

      return false
    },
    toLink (slug) {
      if (slug === 'index') {
        return this.localePath('slug')
      }
      return this.localePath({ name: 'slug', params: { slug } })
    }
  },
  head () {
    const i18nSeo = this.$nuxtI18nSeo()

    return {
      titleTemplate: (chunk) => {
        if (chunk) {
          return `${chunk} - ${this.settings.title}`
        }

        return this.settings.title
      },
      meta: [
        // Open Graph
        { hid: 'og:site_name', property: 'og:site_name', content: this.settings.title },
        { hid: 'og:type', property: 'og:type', content: 'website' },
        { hid: 'og:url', property: 'og:url', content: this.settings.url },
        { hid: 'og:image', property: 'og:image', content: `${this.settings.url}/card.png` },
        // Twitter Card
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:site', name: 'twitter:site', content: this.settings.twitter },
        { hid: 'twitter:title', name: 'twitter:title', content: this.settings.title },
        { hid: 'twitter:image', name: 'twitter:image', content: `${this.settings.url}/card.png` },
        { hid: 'twitter:image:alt', name: 'twitter:image:alt', content: this.settings.title }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ],
      bodyAttrs: {
        class: [...this.bodyClass, 'antialiased text-gray-700 leading-normal bg-white dark:bg-gray-900 dark:text-gray-100']
      },
      ...i18nSeo
    }
  }
}
</script>
