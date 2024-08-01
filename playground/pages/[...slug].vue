<template>
  <div class="content-page">
    <MDCRenderer
      v-if="data"
      :body="data?.body"
    />
    {{ data }}
  </div>
</template>

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

<style>
.content-page {
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  padding: 1rem;
  margin: 0;
}
</style>
