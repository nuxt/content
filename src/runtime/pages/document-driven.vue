<script setup lang="ts">
import { computed, useDocumentDriven, useHead } from '#imports'

const { page } = useDocumentDriven()

const cover = computed(() => {
  const cover = page.value?.cover /* || theme.value?.cover */

  if (typeof cover === 'string') {
    return { src: cover, alt: page.value?.title /* || theme.value.title */ }
  }

  return cover || {}
})

useHead({
  bodyAttrs: {
    class: []
  },
  title: page.value?.title,
  titleTemplate: /* theme.value?.title ? '%s | Playground' : */ '%s',
  meta: [
    { hid: 'description', name: 'description', content: page.value?.description /* || theme.value?.description */ },
    { hid: 'og:site_name', property: 'og:site_name', content: 'Nuxt' },
    { hid: 'og:type', property: 'og:type', content: 'website' },
    {
      hid: 'twitter:site',
      name: 'twitter:site',
      content: '' /* theme.value?.url || theme.value?.socials?.twitter || '' */
    },
    {
      hid: 'twitter:card',
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      hid: 'og:image',
      property: 'og:image',
      content: cover.value.src || ''
    },
    {
      hid: 'og:image:secure_url',
      property: 'og:image:secure_url',
      content: cover.value.src || ''
    },
    {
      hid: 'og:image:alt',
      property: 'og:image:alt',
      content: cover.value.alt || ''
    },
    {
      hid: 'twitter:image',
      name: 'twitter:image',
      content: cover.value.src || ''
    }
  ]
})
</script>

<template>
  <div class="document-driven-content">
    <ContentRenderer v-if="page" :key="page._id" :value="page">
      <template #empty="{ value }">
        <DocumentDrivenEmpty :value="value" />
      </template>
    </ContentRenderer>

    <DocumentDrivenNotFound v-else />
  </div>
</template>

<style>
.document-driven-content {
  padding: 1rem;
}
</style>
