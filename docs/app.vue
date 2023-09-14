<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo'

const { mapContentNavigation } = useElementsHelpers()

const route = useRoute()

useServerSeoMeta({
  ogSiteName: 'Nuxt Content',
  twitterCard: 'summary_large_image'
})

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: () => [
    { rel: 'canonical', href: `https://content.nuxtjs.org${withoutTrailingSlash(route.path)}` }
  ]
})

const links = [{
  label: 'Documentation',
  to: '/get-started'
}, {
  label: 'Playground',
  to: '/playground'
}, {
  label: 'Releases',
  to: 'https://github.com/nuxt/content/releases',
  target: '_blank'
}]

const { data: files } = useLazyFetch('/api/search.json', {
  default: () => [],
  server: false
})

const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())

// Provide
provide('navigation', navigation)
</script>

<template>
  <UHeader :links="links">
    <template #logo>
      <Logo class="h-6 w-auto" />
    </template>

    <template #right>
      <UColorModeButton v-if="!$colorMode.forced" />
      <USocialButton aria-label="Nuxt Website" icon="i-simple-icons-nuxtdotjs" to="https://nuxt.com" />
      <USocialButton aria-label="Nuxt on X" icon="i-simple-icons-x" to="https://x.com/nuxt_js" />
      <USocialButton
        aria-label="Nuxt Content on GitHub"
        icon="i-simple-icons-github"
        to="https://github.com/nuxt/content"
      />
    </template>
    <!-- Mobile panel -->
    <template v-if="$route.path !== '/'" #panel>
      <LazyUDocsSearchButton size="md" class="mb-4 w-full" />
      <LazyUNavigationTree :links="mapContentNavigation(navigation)" default-open :multiple="false" />
    </template>
  </UHeader>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <UFooter :links="links">
    <template #left>
      <span class="text-sm">
        Published under <NuxtLink to="https://github.com/nuxt/content" target="_blank" class="underline">
          MIT License
        </NuxtLink>
      </span>
    </template>
    <template #right>
      <UColorModeButton v-if="!$colorMode.forced" />
      <USocialButton aria-label="Nuxt Website" icon="i-simple-icons-nuxtdotjs" to="https://nuxt.com" />
      <USocialButton aria-label="Nuxt on X" icon="i-simple-icons-x" to="https://x.com/nuxt_js" />
      <USocialButton
        aria-label="Nuxt Devtools on GitHub"
        icon="i-simple-icons-github"
        to="https://github.com/nuxt/content"
      />
    </template>
  </UFooter>
  <ClientOnly>
    <LazyUDocsSearch :files="files" :navigation="navigation" :links="links" />
  </ClientOnly>
</template>

<style>
.shiki {
  padding: 0.6rem;
  border-radius: 0.2rem;
  border: 1px solid #8882;
}

html.dark .shiki,
html.dark .shiki span {
  color: var(--s-dark) !important;
  background-color: var(--s-dark-bg) !important;
}
</style>
