<script setup>
const { data: document } = await useAsyncData('home', () => {
  return queryContent('/').findOne()
})
</script>

<template>
  <NuxtExampleLayout example="mdc/nested-components" repo="nuxt/content">
    <template #icon>
      Nuxt/content
    </template>
    <main>
      <Content v-if="document" :document="document" />
    </main>
  </NuxtExampleLayout>
</template>

<style>
  section, aside {
    margin-left: 2rem;
  }
</style>
