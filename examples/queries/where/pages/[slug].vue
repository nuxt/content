<script setup>
const { path } = useRoute()

const { data: document } = await useAsyncData(`content-${route.path}`, () => {
  return queryContent().where({ path }).findOne()
})
</script>

<template>
  <main>
    <Document v-if="document" :document="document" />
  </main>
</template>
