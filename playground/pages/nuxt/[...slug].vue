<script setup lang="ts">
const route = useRoute()

const { data: navigation } = await useAsyncData('nuxt-contents-list', () => queryCollectionNavigation('nuxt'))
const { data } = await useAsyncData('posts' + route.path, async () => {
  return await queryCollection('nuxt').path(route.path).first()
})

const { data: surround } = await useAsyncData('nuxt-docs-surround' + route.path, () => {
  return queryCollectionItemSurroundings('nuxt', route.path, {
    before: 1,
    after: 1,
    fields: ['title', 'description'],
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
