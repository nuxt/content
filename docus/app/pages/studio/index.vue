<script setup lang="ts">
const siteConfig = useSiteConfig()

const { data: page } = await useAsyncData('studio-landing', () => queryCollection('landing').path('/studio').first())
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
