<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo'
import colors from 'tailwindcss/colors'

const route = useRoute()
const appConfig = useAppConfig()
const colorMode = useColorMode()

function mapPath(data) {
  return data.map((item) => {
    if (item.children) {
      item.children = mapPath(item.children)
    }
    return {
      ...item,
      _path: item.path,
    }
  })
}
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'), {
  default: () => [],
  transform: mapPath,
})
const { data: files } = await useAsyncData('search', () => queryCollectionSearchSections('docs'))

const searchTerm = ref('')

// watch(searchTerm, debounce((query: string) => {
//   if (!query) {
//     return
//   }

//   useTrackEvent('Search', { props: { query: `${query} - ${searchTerm.value?.commandPaletteRef.results.length} results` } })
// }, 500))

const links = computed(() => {
  return [{
    label: 'Docs',
    icon: 'i-heroicons-book-open',
    to: '/getting-started',
    active: route.path.startsWith('/getting-started') || route.path.startsWith('/components'),
  }, {
    label: 'Releases',
    icon: 'i-heroicons-rocket-launch',
    to: '/releases',
  }].filter(Boolean)
})

const color = computed(() => colorMode.value === 'dark' ? (colors as any)[appConfig.ui.colors.neutral][900] : 'white')
const radius = computed(() => `:root { --ui-radius: ${appConfig.theme.radius}rem; }`)

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
    { rel: 'canonical', href: `https://content.nuxt.com${withoutTrailingSlash(route.path)}` },
  ],
  style: [
    { innerHTML: radius, id: 'nuxt-ui-radius', tagPriority: -2 },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

useServerSeoMeta({
  ogSiteName: 'Nuxt Content',
  twitterCard: 'summary_large_image',
})

provide('navigation', navigation)
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLoadingIndicator color="#FFF" />

    <template v-if="!route.path.startsWith('/examples')">
      <Banner />

      <Header :links="links" />
    </template>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <template v-if="!route.path.startsWith('/examples')">
      <Footer />

      <ClientOnly>
        <LazyUContentSearch
          v-model:search-term="searchTerm"
          :files="files"
          :navigation="navigation"
          :fuse="{ resultLimit: 42 }"
        />
      </ClientOnly>
    </template>
  </UApp>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui-pro";

@source "../content/**/*.md";

@theme {
  --font-family-sans: 'Public Sans', sans-serif;

  --color-green-50: #EFFDF5;
  --color-green-100: #D9FBE8;
  --color-green-200: #B3F5D1;
  --color-green-300: #75EDAE;
  --color-green-400: #00DC82;
  --color-green-500: #00C16A;
  --color-green-600: #00A155;
  --color-green-700: #007F45;
  --color-green-800: #016538;
  --color-green-900: #0A5331;
  --color-green-950: #052E16;
}

:root {
  --ui-container-width: 90rem;
}
</style>
