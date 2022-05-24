<script setup>
const { data } = await useAsyncData('homepage', () => {
  return queryContent('/').only(['title']).findOne()
})
</script>

<template>
  <NuxtExampleLayout example="queries/only" repo="nuxt/content">
    <h1>{{ data.title }}</h1>
  </NuxtExampleLayout>
</template>
