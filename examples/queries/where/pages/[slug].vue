<script setup>
const route = useRoute()

const { data: document } = await useAsyncData(`content-${route.path}`, () => {
  return queryContent().where({ slug: route.path }).findOne()
})
</script>

<template>
  <main>
    <Content v-if="document" :document="document" />
  </main>
</template>
