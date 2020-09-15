<template>
  <div
    class="flex flex-wrap-reverse"
    :class="{
      'lg:-mx-8': settings.layout === 'single'
    }"
  >
    <div
      class="w-full lg:w-3/4 py-4 lg:pt-8 lg:pb-4 dark:border-gray-800"
      :class="{
        'lg:border-l lg:border-r': settings.layout !== 'single'
      }"
    >
      <article class="prose dark:prose-dark max-w-none lg:px-8">
        <h1>Releases</h1>

        <div v-for="release of releases" :key="release.name">
          <h2 :id="release.name" class="flex items-center justify-between">
            {{ release.name }}
            <span
              class="text-base font-normal text-gray-500"
            >{{ formatDate(release) }}</span>
          </h2>

          <div class="nuxt-content" v-html="release.body" />
        </div>
      </article>
    </div>
    <AppToc :toc="toc" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  layout ({ store }) {
    return store.state.settings.layout || 'default'
  },
  computed: {
    ...mapGetters([
      'settings'
    ]),
    releases () {
      return this.$store.state.releases
    },
    toc () {
      return this.releases.map(release => ({ id: release.name, depth: 2, text: release.name }))
    }
  },
  methods: {
    formatDate (release) {
      const date = new Date(release.date)

      return date.toLocaleDateString(this.$i18n.locale)
    }
  },
  head () {
    return {
      title: 'Releases'
    }
  }
}
</script>
