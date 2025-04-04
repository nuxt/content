<script setup lang="ts">
const route = useRoute()

const { data: navigation } = await useAsyncData('vue-contents-list', () => queryCollectionNavigation('vue'))
const { data } = await useAsyncData('posts' + route.path, async () => {
  return await queryCollection('vue').path(route.path).first()
})

const { data: surround } = await useAsyncData('vue-docs-surround' + route.path, () => {
  return queryCollectionItemSurroundings('vue', route.path, {
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
