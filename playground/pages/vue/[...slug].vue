<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData('posts' + route.path, async () => {
  const res = await queryCollection('vue').path(route.path).first()

  return res
})

const { data: surround } = await useAsyncData('docs-surround' + route.path, () => {
  return queryCollectionItemSurroundings('vue', route.path, {
    before: 1,
    after: 1,
    fields: ['title', 'description'],
  })
})

definePageMeta({
  layout: 'vue',
  layoutTransition: false,
})
</script>

<template>
  <div class="content-page">
    <ContentRenderer
      v-if="data"
      :value="data"
    />
    <h2>Surround</h2>
    <pre>{{ surround }}</pre>
    <hr>
  </div>
</template>
