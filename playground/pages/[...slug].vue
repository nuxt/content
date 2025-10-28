<script setup lang="ts">
const route = useRoute()

const { data: navigation } = await useAsyncData('contents-list', () => queryCollectionNavigation('content'))
const { data } = await useAsyncData(() => 'posts' + route.path, async () => {
  return await queryCollection('content').path(route.path).first()
})

const { data: surround } = await useAsyncData(() => 'content-surround' + route.path, () => {
  return queryCollectionItemSurroundings('content', route.path, {
    before: 1,
    after: 1,
    fields: ['title', 'description'],
  })
})
</script>

<template>
  <ContentPage
    v-if="data"
    :data="data"
    :navigation="navigation"
    :surround="surround"
  />
</template>
