<template>
  <div v-if="link" class="pt-4 pb-4 lg:px-8 flex">
    <a
      :href="link"
      target="_blank"
      rel="noopener"
      class="text-gray-600 dark:text-gray-400 text-sm font-medium hover:underline flex items-center"
    >
      {{ $t('article.github') }}
      <IconExternalLink class="w-4 h-4 ml-1" />
    </a>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    document: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters([
      'settings',
      'lastRelease'
    ]),
    link () {
      if (!this.settings.repo) {
        return
      }

      return `https://github.com/${this.settings.repo}/edit/dev/docs/content${this.document.path}${this.document.extension}`
    }
  }
}
</script>
