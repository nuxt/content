<script setup>
const { data: document } = await useAsyncData('home', () => {
  return queryContent('/').findOne()
})
</script>

<template>
  <NuxtExampleLayout example="essentials/hello-world" repo="nuxt/content">
    <template #icon>
      Nuxt/content
    </template>
    <main>
      <Content v-if="document" :document="document" />
    </main>
  </NuxtExampleLayout>
</template>
