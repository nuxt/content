<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData('posts' + route.path, async () => {
  return await queryCollection('content').path(route.path).first()
})

const { data: surround } = await useAsyncData('content-surround' + route.path, () => {
  return queryCollectionItemSurroundings('content', route.path, {
    before: 1,
    after: 1,
    fields: ['title', 'description'],
  })
})

definePageMeta({
  layout: 'default',
  layoutTransition: false,
})
</script>

<template>
  <div class="content-page">
    <ContentRenderer
      v-if="data"
      :value="data"
    >
      <template #empty>
        <div>
          <h1>Nobody Exists</h1>
        </div>
      </template>
    </ContentRenderer>
    <h2>Surround</h2>
    <pre>{{ surround }}</pre>
  </div>
</template>
