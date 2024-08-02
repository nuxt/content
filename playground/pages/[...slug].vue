<script setup lang="ts">
import { definePageMeta, useAsyncData } from '#imports'

const route = useRoute()

const { data } = await useAsyncData('posts' + route.path, () => {
  return queryContentV3(route.path).where({ $or: [
    { _path: route.path, _locale: 'en' },
    { _path: { $contains: 'far' }, _locale: 'en' },
  ] }).findOne()
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
    <h2>Data</h2>
    <pre>{{ data }}</pre>
  </div>
</template>
