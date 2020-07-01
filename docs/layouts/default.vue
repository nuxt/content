<template>
  <div class="pt-16">
    <Navbar />
    <main class="container mx-auto px-4 lg:px-8">
      <div class="flex flex-wrap relative">
        <aside
          class="w-full lg:w-1/5 lg:block fixed lg:relative inset-0 mt-16 lg:mt-0 z-30 bg-white dark:bg-gray-900 lg:bg-transparent"
          :class="{ 'block': menu, 'hidden': !menu }"
        >
          <div class="lg:sticky lg:top-0 lg:pt-24 lg:-mt-24 overflow-y-scroll h-full lg:h-auto">
            <ul class="lg:pl-0 p-4 lg:py-0 lg:pr-8">
              <li class="mb-4 lg:hidden">
                <SearchInput />
              </li>
              <li v-for="(docs, category) in categories" :key="category" class="mb-4">
                <h3
                  class="mb-2 text-gray-500 dark:text-gray-600 uppercase tracking-wide font-bold text-sm lg:text-xs"
                >{{ category }}</h3>
                <ul>
                  <li v-for="doc of docs" :key="doc.slug" class="text-gray-600 dark:text-gray-500">
                    <NuxtLink
                      :to="toLink(doc.slug)"
                      class="px-2 rounded font-medium py-1 block hover:text-gray-800 dark-hover:text-gray-100"
                      exact-active-class="text-green-600 bg-green-100 hover:text-green-600 dark:text-white dark:bg-green-800 dark-hover:text-white"
                    >{{ doc.title }}</NuxtLink>
                  </li>
                </ul>
              </li>
              <li class="mb-4 lg:hidden">
                <h3
                  class="mb-2 text-gray-500 dark:text-gray-600 uppercase tracking-wide font-bold text-sm lg:text-xs"
                >More</h3>
                <ul class="flex items-center ml-2">
                  <li class="mr-4">
                    <a
                      href="https://twitter.com/nuxt_js"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Twitter"
                      name="Twitter"
                      class="hover:text-green-500"
                    >
                      <icon-twitter class="w-6 h-6" />
                    </a>
                  </li>
                  <li class="mr-4">
                    <a
                      href="https://github.com/nuxt/content"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Github"
                      name="Github"
                      class="hover:text-green-500"
                    >
                      <icon-github class="w-6 h-6" />
                    </a>
                  </li>
                  <li class="mr-4">
                    <LangSwitcher />
                  </li>
                  <li>
                    <ColorSwitcher />
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </aside>

        <Nuxt class="w-full lg:w-4/5" />
      </div>
    </main>
    <TheFooter />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar'
import TheFooter from '@/components/TheFooter'
import SearchInput from '@/components/SearchInput'

export default {
  components: {
    Navbar,
    TheFooter,
    SearchInput
  },
  computed: {
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
      bodyAttrs: {
        class: [...this.bodyClass, 'antialiased text-gray-800 leading-normal bg-white dark:bg-gray-900 dark:text-gray-100']
      },
      ...i18nSeo
    }
  }
}
</script>
