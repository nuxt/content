<script setup lang="ts">
import colors from 'tailwindcss/colors'
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const route = useRoute()
const appConfig = useAppConfig()
const colorMode = useColorMode()

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
const { data: files } = await useAsyncData('files', () => queryCollectionSearchSections('docs', { ignoredTags: ['style'] }))

const color = computed(() => colorMode.value === 'dark' ? colors[appConfig.ui.colors.neutral as keyof typeof colors][900] : 'white')

const links = computed(() => {
  return [{
    label: 'Docs',
    icon: 'i-lucide-book',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs'),
  }].filter(Boolean)
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

useSeoMeta({
  titleTemplate: '%s - Nuxt UI v3',
  title: String(props.error.statusCode),
})

useServerSeoMeta({
  ogSiteName: 'Nuxt UI',
  twitterCard: 'summary_large_image',
})

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="#FFF" />

    <AppBanner />

    <AppHeader :links="links" />

    <UError :error="error" />

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>
  </UApp>
</template>
