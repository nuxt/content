<script setup lang="ts">
const route = useRoute()

const { data: navigation } = await useAsyncData('contents-list', () => queryCollectionNavigation('content'))
const { data } = await useAsyncData('posts' + route.path, async () => $fetch(`/api/content`, {
  params: {
    path: route.path,
  },
}))

const { data: surround } = await useAsyncData('content-surround' + route.path, () => {
  return queryCollectionItemSurroundings('content', route.path, {
    before: 1,
    after: 1,
    fields: ['title', 'description'],
  })
})
</script>

<template>
  <ContentPage
    :data="data"
    :navigation="navigation"
    :surround="surround"
  />
</template>
