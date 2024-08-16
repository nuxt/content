<script setup lang="ts">
import { definePageMeta, useAsyncData } from '#imports'

const route = useRoute()

const { data } = await useAsyncData('posts' + route.path, async () => {
  const res = await queryCollection('content').path(route.path).first()

  return res
})

const { data: surround } = await useAsyncData('content-surround' + route.path, () => {
  return getSurroundingCollectionItems('content', route.path, {
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
    <MDCRenderer
      v-if="data"
      :body="data?.body"
    />
    <h2>Surround</h2>
    <pre>{{ surround }}</pre>
    <hr>
    <h2>Data</h2>
    <pre>{{ data }}</pre>
  </div>
</template>
