<template>
  <div class="flex flex-wrap-reverse">
    <div class="w-full lg:w-3/4 py-4 lg:pt-8 lg:pb-4 dark:border-gray-800 lg:border-l lg:border-r">
      <article class="prose dark:prose-dark max-w-none lg:px-8">
        <h1>Releases</h1>

        <div v-for="release of releases" :key="release.name">
          <h2 :id="release.name" class="flex items-center justify-between">
            {{ release.name }}
            <span
              class="text-base font-normal text-gray-500"
            >{{ $moment(release.date).format('L') }}</span>
          </h2>

          <div class="nuxt-content" v-html="release.body" />
        </div>
      </article>
    </div>
    <ArticleToc :toc="toc" />
  </div>
</template>

<script>
export default {
  computed: {
    releases () {
      return this.$store.state.releases
    },
    toc () {
      return this.releases.map(release => ({ id: release.name, depth: 2, text: release.name }))
    }
  },
  head () {
    return {
      title: 'Releases'
    }
  }
}
</script>
