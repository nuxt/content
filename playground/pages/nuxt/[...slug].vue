<script setup lang="ts">
const route = useRoute()

const { data: navigation } = await useAsyncData('nuxt-contents-list', (_nuxtApp, { signal }) => queryCollectionNavigation('nuxt', [], { signal }))
const { data } = await useAsyncData('posts' + route.path, async (_nuxtApp, { signal }) => {
  return await queryCollection('nuxt').path(route.path).first({ signal })
})

const { data: surround } = await useAsyncData('nuxt-docs-surround' + route.path, (_nuxtApp, { signal }) => {
  return queryCollectionItemSurroundings('nuxt', route.path, {
    before: 1,
    after: 1,
    fields: ['title', 'description'],
    signal,
  })
})
</script>

<template>
  <ContentPage
    :data="data"
    :navigation="navigation?.[0]?.children"
    :surround="surround"
  />
</template>
