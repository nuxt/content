<template>
  <div class="pt-4 pb-4 lg:px-8 flex border-b dark:border-gray-800">
    <a :href="link" target="_blank" rel="noopener" class="text-gray-600 dark:text-gray-400 text-sm font-medium hover:underline flex items-center">
      {{ $t('article.github') }}
      <icon-external-link class="w-4 h-4 ml-1" />
    </a>
  </div>
</template>

<script>
export default {
  props: {
    document: {
      type: Object,
      required: true
    }
  },
  computed: {
    link () {
      return `https://github.com/nuxt/content/edit/master/docs/content${this.document.path}${this.document.extension}`
    }
  }
}
</script>
