<script setup lang="ts">
const siteConfig = useSiteConfig()

const { data: page } = await useAsyncData('studio-landing', (_nuxtApp, { signal }) => queryCollection('landing').path('/studio').first({ signal }))
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.seo?.title,
  description: page.value.seo?.description,
  ogTitle: page.value.seo?.title,
  ogDescription: page.value.seo?.description,
  ogImage: `${siteConfig.url}/studio-social.png`,
  twitterImage: `${siteConfig.url}/studio-social.png`,
})
</script>

<template>
  <UContainer>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </UContainer>
</template>
