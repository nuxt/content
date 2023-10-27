<script setup lang="ts">
const route = useRoute()

useServerSeoMeta({
  ogSiteName: 'Nuxt Content',
  twitterCard: 'summary_large_image'
})

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

const links = [{
  label: 'Documentation',
  icon: 'i-heroicons-book-open-solid',
  to: '/get-started/installation'
}, {
  label: 'Playground',
  icon: 'i-ph-play-duotone',
  to: '/playground'
}, {
  label: 'Releases',
  icon: 'i-heroicons-rocket-launch-solid',
  to: 'https://github.com/nuxt/content/releases',
  target: '_blank'
}]

const { data: files } = useLazyFetch('/api/search.json', {
  default: () => [],
  server: false
})

const { data: nav } = await useAsyncData('navigation', () => fetchContentNavigation())

const navigation = computed(() => {
  const main = nav.value?.filter(item => item._path !== '/v1')
  const v1 = nav.value?.find(item => item._path === '/v1')?.children

  return route.path.startsWith('/v1/') ? v1 : main
})

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
      <UButton
        aria-label="Nuxt Website"
        icon="i-simple-icons-nuxtdotjs"
        to="https://nuxt.com"
        target="_blank"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt on X"
        icon="i-simple-icons-x"
        to="https://x.com/nuxt_js"
        target="_blank"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt Content on GitHub"
        icon="i-simple-icons-github"
        to="https://github.com/nuxt/content"
        target="_blank"
        color="gray"
        variant="ghost"
      />
    </template>
    <!-- Mobile panel -->
    <template v-if="$route.path !== '/'" #panel>
      <LazyUDocsSearchButton size="md" class="mb-4 w-full" />
      <LazyUNavigationTree :links="mapContentNavigation(navigation!)" default-open :multiple="false" />
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
      <UButton
        aria-label="Nuxt Website"
        icon="i-simple-icons-nuxtdotjs"
        to="https://nuxt.com"
        target="_blank"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt on X"
        icon="i-simple-icons-x"
        to="https://x.com/nuxt_js"
        target="_blank"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt Devtools on GitHub"
        icon="i-simple-icons-github"
        to="https://github.com/nuxt/content"
        target="_blank"
        color="gray"
        variant="ghost"
      />
    </template>
  </UFooter>
  <ClientOnly>
    <LazyUDocsSearch :files="files" :navigation="navigation" :links="links" />
  </ClientOnly>
</template>
