<script setup lang="ts">
import { computed, useDocus, useHead } from '#imports'

definePageMeta({
  /* Layout transitions creates layout shifts with defaults */
  layoutTransition: false,
  middleware: ['navigation', 'github', 'page']
})

const { page, theme } = useDocus()

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
  titleTemplate: theme.value?.title ? `%s | ${theme.value.title}` : '%s',
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
  <ContentRenderer v-if="page" :value="page" class="docus-content" />
</template>
