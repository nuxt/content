<script setup lang="ts">
const { seo } = useAppConfig()
const site = useSiteConfig()

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'), {
  transform: data => data.find(item => item.path === '/docs')?.children || data || [],
})
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
  server: false,
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

useSeoMeta({
  titleTemplate: seo.titleTemplate,
  title: seo.title,
  description: seo.description,
  ogSiteName: site.name,
  twitterCard: 'summary_large_image',
})

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <UBanner
      id="nuxt-joins-vercel"
      title="NuxtLabs is joining Vercel"
      icon="i-simple-icons-vercel"
      to="https://nuxtlabs.com/?utm_source=nuxt-content&utm_medium=banner&utm_campaign=nuxtlabs-vercel"
      close
      :actions="[
        {
          label: 'Read the announcement',
          color: 'neutral',
          variant: 'outline',
          trailingIcon: 'i-lucide-arrow-right',
          to: 'https://nuxtlabs.com/?utm_source=nuxt-content&utm_medium=banner&utm_campaign=nuxtlabs-vercel',
        },
      ]"
    />

    <AppHeader />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </UApp>
</template>
