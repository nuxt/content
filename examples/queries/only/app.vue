<script setup>
const { data: document } = await useAsyncData('homepage', () => {
  return queryContent('/').only(['title']).findOne()
})
</script>

<template>
  <NuxtExampleLayout example="queries/only" repo="nuxt/content-next">
    <template #icon>
      Nuxt/content
    </template>
    <h1>{{ document.title }}</h1>
  </NuxtExampleLayout>
</template>
