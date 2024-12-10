<script setup lang="ts">
const siteConfig = useSiteConfig()

// const { data: page } = await useAsyncData('pricing', () => queryCollection('pricing').first())
// if (!page.value) {
//   throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
// }

// useSeoMeta({
//   title: page.value.seo?.title,
//   description: page.value.seo?.description,
//   ogTitle: page.value.seo?.title,
//   ogDescription: page.value.seo?.description,
//   ogImage: `${siteConfig.url}/social.png`,
//   twitterImage: `${siteConfig.url}/social.png`,
// })
</script>

<template>
  <pre>
    Pricing
  </pre>
</template>
