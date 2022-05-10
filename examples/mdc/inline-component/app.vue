<script setup>
const { data: document } = await useAsyncData('home', () => {
  return queryContent('/').findOne()
})
</script>

<template>
  <NuxtExampleLayout example="mdc/inline-component" repo="nuxt/content">
    <template #icon>
      Nuxt/content
    </template>
    <main>
      <Content v-if="document" :document="document" />
    </main>
  </Nuxtexamplelayout>
</template>
