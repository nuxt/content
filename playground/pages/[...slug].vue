<script setup lang="ts">
import { definePageMeta, useAsyncData } from '#imports'

const route = useRoute()

const { data } = await useAsyncData('posts' + route.path, async () => {
  const res = await queryContentV3(route.path).findOne()

  return res
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
