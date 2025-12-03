<script setup lang="ts">
const route = useRoute()

const { data: navigation } = await useAsyncData('vue-contents-list', (_nuxtApp, { signal }) => queryCollectionNavigation('vue', [], { signal }))
const { data } = await useAsyncData('posts' + route.path, async (_nuxtApp, { signal }) => {
  return await queryCollection('vue').path(route.path).first({ signal })
})

const { data: surround } = await useAsyncData('vue-docs-surround' + route.path, (_nuxtApp, { signal }) => {
  return queryCollectionItemSurroundings('vue', route.path, {
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
