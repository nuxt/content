<script setup>
const { path } = useRoute()

const { data } = await useAsyncData(`content-${route.path}`, () => {
  return queryContent().where({ path }).findOne()
})
</script>

<template>
  <main>
    <ContentRenderer v-if="data" :value="data" />
  </main>
</template>
