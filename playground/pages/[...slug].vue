<script setup lang="ts">
const route = useRoute()

const { data: navigation } = await useAsyncData('contents-list', (_nuxtApp, { signal }) => queryCollectionNavigation('content', [], { signal }))
const { data } = await useAsyncData(() => 'posts' + route.path, async (_nuxtApp, { signal }) => {
  return await queryCollection('content').path(route.path).first({ signal })
})

const { data: surround } = await useAsyncData(() => 'content-surround' + route.path, (_nuxtApp, { signal }) => {
  return queryCollectionItemSurroundings('content', route.path, {
    before: 1,
    after: 1,
    fields: ['title', 'description'],
    signal,
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
