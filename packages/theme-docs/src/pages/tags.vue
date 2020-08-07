<template>
  <div class="flex flex-wrap-reverse">
    <div class="w-full lg:w-3/4 py-4 lg:pt-8 lg:pb-4 dark:border-gray-800 lg:border-l lg:border-r">
      <article class="prose dark:prose-dark max-w-none lg:px-8">
        <h1>Tags</h1>

        <div v-for="tag of tags" :key="tag.name">
          <h2 :id="tag.name" class="flex items-center justify-between">
            {{ tag.name }}
            <span
              class="text-base font-normal text-gray-500"
            >{{ formatDate(tag) }}</span>
          </h2>

          <div v-if="tag.zipball || tag.tarball" class="flex items-center">
            <a
              v-if="tag.zipball"
              :href="tag.zipball"
              target="_blank"
              rel="noopener"
              class="text-gray-600 dark:text-gray-400 text-sm font-medium hover:underline flex items-center"
            >
              <IconExternalLink class="w-4 h-4 mr-1" />
              zip
            </a>
            <a
              v-if="tag.tarball"
              :href="tag.tarball"
              target="_blank"
              rel="noopener"
              class="text-gray-600 dark:text-gray-400 text-sm font-medium hover:underline flex items-center"
            >
              <IconExternalLink class="w-4 h-4 mr-1" />
              zip
            </a>
          </div>
        </div>
      </article>
    </div>
    <AppToc :toc="toc" />
  </div>
</template>

<script>
export default {
  computed: {
    tags () {
      return this.$store.state.tags
    },
    toc () {
      return this.tags.map(tag => ({ id: tag.name, depth: 2, text: tag.name }))
    }
  },
  methods: {
    formatDate (tag) {
      const date = new Date(tag.date)

      return date.toLocaleDateString(this.$i18n.locale)
    }
  },
  head () {
    return {
      title: 'Tags'
    }
  }
}
</script>
