<template>
  <div class="pt-16">
    <AppHeader />
    <main class="container mx-auto px-4 lg:px-8">
      <div class="flex flex-wrap relative">
        <aside
          class="w-full lg:w-1/5 lg:block fixed lg:relative inset-0 mt-16 lg:mt-0 z-30 bg-white dark:bg-gray-900 lg:bg-transparent"
          :class="{ 'block': menu, 'hidden': !menu }"
        >
          <div class="lg:sticky lg:top-16 lg:-mb-16 overflow-y-auto h-full lg:h-(screen-16)">
            <ul class="p-4 lg:py-8 lg:pl-0 lg:pr-8">
              <li class="mb-4 lg:hidden">
                <AppSearch />
              </li>
              <li
                v-for="(docs, category, index) in categories"
                :key="category"
                class="mb-4"
                :class="{ 'lg:mb-0': index === Object.keys(categories).length - 1 }"
              >
                <h3
                  class="mb-2 text-gray-500 uppercase tracking-wider font-bold text-sm lg:text-xs"
                >{{ category }}</h3>
                <ul>
                  <li v-for="doc of docs" :key="doc.slug" class="text-gray-700 dark:text-gray-300">
                    <NuxtLink
                      :to="toLink(doc.slug)"
                      class="px-2 rounded font-medium py-1 hover:text-primary-500 flex items-center justify-between"
                      exact-active-class="text-primary-500 bg-primary-100 hover:text-primary-500 dark:bg-primary-900"
                    >
                      {{ doc.menuTitle || doc.title }}
                      <client-only>
                        <span
                          v-if="isNew(doc)"
                          class="animate-pulse rounded-full bg-primary-500 opacity-75 h-2 w-2"
                        />
                      </client-only>
                    </NuxtLink>
                  </li>
                </ul>
              </li>
              <li class="lg:hidden">
                <h3
                  class="mb-2 text-gray-500 uppercase tracking-wider font-bold text-sm lg:text-xs"
                >More</h3>
                <div class="flex items-center ml-2">
                  <a
                    v-if="settings.twitter"
                    href="`https://twitter.com/${settings.twitter}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Twitter"
                    name="Twitter"
                    class="inline-flex text-gray-700 dark:text-gray-300 hover:text-primary-500 mr-4"
                  >
                    <IconTwitter class="w-5 h-5" />
                  </a>
                  <a
                    v-if="settings.github"
                    :href="`https://github.com/${settings.github}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Github"
                    name="Github"
                    class="inline-flex text-gray-700 dark:text-gray-300 hover:text-primary-500 mr-4"
                  >
                    <IconGithub class="w-5 h-5" />
                  </a>

                  <AppLangSwitcher class="mr-4" />
                  <AppColorSwitcher />
                </div>
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
      bodyAttrs: {
        class: [...this.bodyClass, 'antialiased text-gray-700 leading-normal bg-white dark:bg-gray-900 dark:text-gray-300']
      },
      ...i18nSeo,
      meta: (i18nSeo.meta || []).concat([
        // Open Graph
        { hid: 'og:site_name', property: 'og:site_name', content: this.settings.title },
        { hid: 'og:type', property: 'og:type', content: 'website' },
        { hid: 'og:url', property: 'og:url', content: this.settings.url },
        { hid: 'og:image', property: 'og:image', content: `${this.settings.url}/preview.png` },
        // Twitter Card
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:site', name: 'twitter:site', content: this.settings.twitter },
        { hid: 'twitter:title', name: 'twitter:title', content: this.settings.title },
        { hid: 'twitter:image', name: 'twitter:image', content: `${this.settings.url}/preview.png` },
        { hid: 'twitter:image:alt', name: 'twitter:image:alt', content: this.settings.title }
      ])
    }
  }
}
</script>
