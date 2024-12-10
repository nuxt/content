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
  ogImage: `${siteConfig.url}/social.png`,
  twitterImage: `${siteConfig.url}/social.png`,
})
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
  />
</template>
