<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData('posts' + route.path, async () => {
  const res = await queryCollection('nuxt').path(route.path).first()

  return res
})

const { data: surround } = await useAsyncData('docs-surround' + route.path, () => {
  return queryCollectionItemSurroundings('nuxt', route.path, {
    before: 1,
    after: 1,
    fields: ['title', 'description'],
  })
})

definePageMeta({
  layout: 'nuxt',
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
    <hr>
  </div>
</template>
