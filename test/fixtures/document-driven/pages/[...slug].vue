<script setup lang="ts">
import { computed, useContent, useHead, useTheme } from '#imports'

const { page } = useContent()

const theme = useTheme()

const cover = computed(() => {
  const cover = page.value?.cover || theme.value?.cover

  if (typeof cover === 'string') {
    return { src: cover, alt: page.value?.title || theme.value.title }
  }

  return cover || {}
})

useHead({
  bodyAttrs: {
    class: []
  },
  title: page.value?.title,
  titleTemplate: theme.value?.title ? '%s | Document Driven Fixture' : '%s',
  meta: [
    { hid: 'description', name: 'description', content: page.value?.description || theme.value?.description },
    { hid: 'og:site_name', property: 'og:site_name', content: 'Nuxt' },
    { hid: 'og:type', property: 'og:type', content: 'website' },
    {
      hid: 'twitter:site',
      name: 'twitter:site',
      content: theme.value?.url || theme.value?.socials?.twitter || ''
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
        <p>
          You have succesfully created the page: <span class="font-semibold">{{ value._path }}</span>
        </p>

        <p>
          You can now start writing into: <span class="font-semibold">{{ value._source }}/{{ value._file }}</span>
        </p>
      </template>
    </ContentRenderer>
  </div>
</template>

<style>
.document-driven-content {
  padding: 1rem;
}
</style>
