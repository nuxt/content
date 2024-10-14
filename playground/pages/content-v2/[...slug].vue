<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData('posts' + route.path, async () => {
  const res = await queryCollection('contentV2').path(route.path).first()

  return res
})

const { data: surround } = await useAsyncData('docs-surround' + route.path, () => {
  return queryCollectionItemSurroundings('contentV2', route.path, {
    before: 1,
    after: 1,
    fields: ['title', 'description'],
  })
})

definePageMeta({
  layout: 'content-v2',
  layoutTransition: false,
})
</script>

<template>
  <div class="content-page">
    <MDCRenderer
      v-if="data"
      :value="data"
    />
    <h2>Surround</h2>
    <pre>{{ surround }}</pre>
  </div>
</template>
