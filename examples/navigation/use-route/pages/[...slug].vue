<script setup>
const { path } = useRoute()

const { data } = await useAsyncData(`content-${path}`, () => {
  return queryContent().where({ _path: path }).findOne()
})
</script>

<template>
  <main class="prose text-left">
    <ContentRenderer v-if="data" :value="data" />
  </main>
</template>
