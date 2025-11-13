<script setup lang="ts">
const route = useRoute()

const { data: navigation } = await useAsyncData('contents-v2-list', (_nuxtApp, { signal }) => queryCollectionNavigation('contentV2', { signal }))
const { data } = await useAsyncData('posts' + route.path, async (_nuxtApp, { signal }) => {
  return await queryCollection('contentV2').path(route.path).first({ signal })
})

const { data: surround } = await useAsyncData('content-v2-docs-surround' + route.path, (_nuxtApp, { signal }) => {
  return queryCollectionItemSurroundings('contentV2', route.path, {
    before: 1,
    after: 1,
    fields: ['title', 'description'],
    signal,
  })
})

const filteredNavigation = computed(() => {
  if (!navigation.value?.[0]?.children) {
    return []
  }

  const children = [...navigation.value[0].children]

  // Give the home item a title
  const homeItem = children.find(item => item.title === '')
  if (homeItem) {
    homeItem.title = 'Home'
  }

  return children
})
</script>

<template>
  <ContentPage
    :data="data"
    :navigation="filteredNavigation"
    :surround="surround"
  />
</template>
